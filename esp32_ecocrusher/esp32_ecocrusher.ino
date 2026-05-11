#include <WiFi.h>
#include <ESP32Servo.h>
#include <WebServer.h>
#include <ESPmDNS.h>

// ================= WIFI =================
const char* WIFI_SSID     = "Parnika’s iPhone";
const char* WIFI_PASSWORD = "12345678";

// ================= PINS =================
const int TRIG1 = 5;
const int ECHO1 = 18;

const int TRIG2 = 21;
const int ECHO2 = 19;

const int IR_PIN = 4;

const int LED_PWR = 25;
const int LED1    = 27;
const int LED2    = 15;

const int TOUCH_PWR = 13;
const int TOUCH_RST = 14;

const int SERVO_PIN = 33;

// ================= OBJECTS =================
Servo myServo;
WebServer server(80);

// ================= VARIABLES =================
bool systemOn = true;

int objectCount = 0;

bool lastIRState = HIGH;

bool servoActive = false;
unsigned long servoMoveTime = 0;

const unsigned long SERVO_HOLD = 1000;

// Touch debounce
unsigned long lastTouchPwrTime = 0;
unsigned long lastTouchRstTime = 0;

const unsigned long TOUCH_COOLDOWN = 500;

// Ultrasonic distances
int dist1 = -1;
int dist2 = -1;

// ================= FUNCTION DECLARATIONS =================
int getDistance(int trig, int echo);

void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
}

// ================= WEB API =================

void handleStatus() {
  sendCORS();

  String json = "{";
  json += "\"count\":" + String(objectCount) + ",";
  json += "\"systemOn\":" + String(systemOn ? "true" : "false") + ",";
  json += "\"dist1\":" + String(dist1) + ",";
  json += "\"dist2\":" + String(dist2) + ",";
  json += "\"bin1Full\":" + String((dist1 > 0 && dist1 < 15) ? "true" : "false") + ",";
  json += "\"bin2Full\":" + String((dist2 > 0 && dist2 < 15) ? "true" : "false") + ",";
  json += "\"servoAngle\":" + String(myServo.read());
  json += "}";

  server.send(200, "application/json", json);
}

void handleReset() {
  sendCORS();

  objectCount = 0;

  Serial.println("COUNT RESET FROM WEB");

  server.send(
    200,
    "application/json",
    "{\"status\":\"ok\",\"count\":0}"
  );
}

void handlePower() {
  sendCORS();

  systemOn = !systemOn;

  digitalWrite(LED_PWR, systemOn ? HIGH : LOW);

  Serial.println(systemOn ? "POWER ON (WEB)" : "POWER OFF (WEB)");

  server.send(
    200,
    "application/json",
    "{\"systemOn\":" + String(systemOn ? "true" : "false") + "}"
  );
}

// ================= SETUP =================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println("\n===== BOOTING SYSTEM =====");

  // -------- PWM TIMERS --------
  // VERY IMPORTANT for WiFi + Servo stability

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  // -------- PIN MODES --------

  pinMode(TRIG1, OUTPUT);
  pinMode(ECHO1, INPUT);

  pinMode(TRIG2, OUTPUT);
  pinMode(ECHO2, INPUT);

  pinMode(IR_PIN, INPUT);

  pinMode(LED_PWR, OUTPUT);
  digitalWrite(LED_PWR, HIGH); // Always ON

  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  // IMPORTANT:
  // INPUT_PULLDOWN gives stable touch/button readings
  pinMode(TOUCH_PWR, INPUT_PULLDOWN);
  pinMode(TOUCH_RST, INPUT_PULLDOWN);

  // -------- WIFI --------

  Serial.print("Connecting to WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retry = 0;

  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("\nWiFi CONNECTED");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // mDNS
    if (MDNS.begin("ecocrusher")) {
      Serial.println("mDNS started");
      Serial.println("Open: http://ecocrusher.local");
    }

  } else {

    Serial.println("\nWiFi FAILED");
  }

  // -------- SERVO --------

  myServo.setPeriodHertz(50);

  myServo.attach(SERVO_PIN, 500, 2400);

  myServo.write(0);

  Serial.println("Servo Ready");

  // -------- WEB ROUTES --------

  server.on("/status", HTTP_GET, handleStatus);

  server.on("/reset", HTTP_POST, handleReset);

  server.on("/power", HTTP_POST, handlePower);

  server.on("/status", HTTP_OPTIONS, []() {
    sendCORS();
    server.send(204);
  });

  server.begin();

  Serial.println("Web Server Started");

  Serial.println("===== SYSTEM READY =====");
}

// ================= LOOP =================

void loop() {

  server.handleClient();

  unsigned long now = millis();

  // =========================================
  // TOUCH POWER BUTTON
  // =========================================

  if (
    digitalRead(TOUCH_PWR) == HIGH &&
    (now - lastTouchPwrTime > TOUCH_COOLDOWN)
  ) {

    systemOn = !systemOn;

    

    Serial.println(systemOn ? "POWER ON" : "POWER OFF");

    lastTouchPwrTime = now;
  }

  // =========================================
  // TOUCH RESET BUTTON
  // =========================================

  if (
    digitalRead(TOUCH_RST) == HIGH &&
    (now - lastTouchRstTime > TOUCH_COOLDOWN)
  ) {

    objectCount = 0;

    Serial.println("COUNT RESET");

    lastTouchRstTime = now;
  }

  // =========================================
  // MAIN SYSTEM
  // =========================================

  if (systemOn) {

    // -------- ULTRASONIC SENSORS --------

    dist1 = getDistance(TRIG1, ECHO1);

    dist2 = getDistance(TRIG2, ECHO2);

    // LED INDICATIONS

    digitalWrite(
      LED1,
      (dist1 > 0 && dist1 < 15) ? HIGH : LOW
    );

    digitalWrite(
      LED2,
      (dist2 > 0 && dist2 < 15) ? HIGH : LOW
    );

    // -------- IR SENSOR --------

    bool curIR = digitalRead(IR_PIN);

    if (
      lastIRState == HIGH &&
      curIR == LOW &&
      !servoActive
    ) {

      objectCount++;

      Serial.print("OBJECT COUNT: ");
      Serial.println(objectCount);

      myServo.write(90);

      servoActive = true;

      servoMoveTime = now;
    }

    lastIRState = curIR;
  }

  // =========================================
  // SERVO RETURN
  // =========================================

  if (
    servoActive &&
    (now - servoMoveTime >= SERVO_HOLD)
  ) {

    myServo.write(0);

    servoActive = false;
  }
}

// ================= ULTRASONIC FUNCTION =================

int getDistance(int trig, int echo) {

  digitalWrite(trig, LOW);
  delayMicroseconds(2);

  digitalWrite(trig, HIGH);
  delayMicroseconds(10);

  digitalWrite(trig, LOW);

  long duration = pulseIn(echo, HIGH, 25000);

  if (duration == 0) {
    return -1;
  }

  int distance = duration * 0.034 / 2;

  return distance;
}
