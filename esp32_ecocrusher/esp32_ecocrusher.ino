#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID     = "Joshi BSNL FIBER 2.4";
const char* WIFI_PASSWORD = "@strOidiot4104";

// Pins
const int TRIG1 = 5;  const int ECHO1 = 18;
const int TRIG2 = 21; const int ECHO2 = 19;
const int IR_PIN = 4;
const int LED_PWR = 25;
const int LED1 = 27;  const int LED2 = 15;
const int TOUCH_PWR = 13; const int TOUCH_RST = 14;
const int SERVO_PIN = 33;

Servo myServo;

// CHANGE: System starts ON
bool systemOn = true; 
int objectCount = 0;
bool lastIRState = HIGH;
bool servoTriggered = false;
unsigned long servoStartTime = 0;

unsigned long lastTouchPwrTime = 0;
unsigned long lastTouchRstTime = 0;
const unsigned long TOUCH_COOLDOWN = 500;

int dist1 = -1; int dist2 = -1;

void setup() {
  // Use 115200 - Ensure Serial Monitor matches this!
  Serial.begin(115200); 
  delay(500); 
  Serial.println("\n--- INITIALIZING SYSTEM ---");

  pinMode(TRIG1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT); pinMode(ECHO2, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(LED_PWR, OUTPUT);
  pinMode(LED1, OUTPUT); pinMode(LED2, OUTPUT);
  pinMode(TOUCH_PWR, INPUT); pinMode(TOUCH_RST, INPUT);

  // Set initial LED state based on systemOn (TRUE)
  digitalWrite(LED_PWR, HIGH); 

  myServo.attach(SERVO_PIN, 500, 2400);
  myServo.write(0);

  Serial.println("Connecting WiFi (Check router if this hangs)...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  // Non-blocking WiFi check (won't freeze the Serial monitor forever)
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi Timed Out - Operating in Offline Mode.");
  }
  
  Serial.println("SYSTEM STATUS: ON (Ready for Touch Input)");
}

void loop() {
  unsigned long now = millis();

  // 1. TOUCH POWER TOGGLE
  if (digitalRead(TOUCH_PWR) == HIGH && (now - lastTouchPwrTime > TOUCH_COOLDOWN)) {
    systemOn = !systemOn;
    digitalWrite(LED_PWR, systemOn ? HIGH : LOW);
    Serial.print("TOUCH DETECTED. SYSTEM IS NOW: ");
    Serial.println(systemOn ? "ON" : "OFF");
    lastTouchPwrTime = now;
  }

  // 2. TOUCH RESET
  if (digitalRead(TOUCH_RST) == HIGH && (now - lastTouchRstTime > TOUCH_COOLDOWN)) {
    objectCount = 0;
    Serial.println("RESET DETECTED. COUNT: 0");
    lastTouchRstTime = now;
  }

  // 3. SENSORS (Only if system is ON)
  if (systemOn) {
    // Ultrasonic Logic
    dist1 = getDistance(TRIG1, ECHO1);
    dist2 = getDistance(TRIG2, ECHO2);
    
    digitalWrite(LED1, (dist1 > 0 && dist1 < 15) ? HIGH : LOW);
    digitalWrite(LED2, (dist2 > 0 && dist2 < 15) ? HIGH : LOW);

    // IR Logic
    bool curIR = digitalRead(IR_PIN);
    if (lastIRState == HIGH && curIR == LOW) {
      objectCount++;
      Serial.print("OBJECT DETECTED! NEW COUNT: ");
      Serial.println(objectCount);
      
      // Servo Action
      myServo.write(60);
      servoTriggered = true;
      servoStartTime = now;
    }
    lastIRState = curIR;
  } else {
    // If system is OFF, keep LEDs off
    digitalWrite(LED1, LOW);
    digitalWrite(LED2, LOW);
  }

  // 4. SERVO AUTO-RETURN
  if (servoTriggered && (now - servoStartTime >= 2000)) {
    myServo.write(0);
    servoTriggered = false;
  }
}

int getDistance(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long dur = pulseIn(echo, HIGH, 25000);
  return (dur == 0) ? -1 : (int)(dur * 0.034 / 2);
}
