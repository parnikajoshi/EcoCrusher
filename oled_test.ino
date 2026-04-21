/*
 * ESP32 Control System Logic (Updated)
 * Touch 1 (GPIO 12): Toggle System ON/OFF
 * Touch 2 (GPIO 14): Reset Object Count
 */

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int IR_PIN = 4;
const int LED1 = 25; // System Status LED
const int LED2 = 27; // Warning LED
const int TOUCH_PWR = 12; 
const int TOUCH_RST = 14;

bool systemOn = false;
int objectCount = 0;
bool lastIRState = HIGH; 
bool lastTouchPwrState = LOW;
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(TOUCH_PWR, INPUT);
  pinMode(TOUCH_RST, INPUT);
}

void loop() {
  // 1. Toggle Power (Touch 1) - State Change Detection
  bool currentTouchPwr = digitalRead(TOUCH_PWR);
  if (currentTouchPwr == HIGH && lastTouchPwrState == LOW) {
    systemOn = !systemOn; // Flip state
    digitalWrite(LED1, systemOn ? HIGH : LOW);
    delay(200); // Debounce
  }
  lastTouchPwrState = currentTouchPwr;

  // 2. Manual Reset (Touch 2)
  if (digitalRead(TOUCH_RST) == HIGH) {
    objectCount = 0;
    // Optional: Visual confirmation of reset
    Serial.println(">> COUNT RESET <<");
    delay(200);
  }

  // 3. Ultrasonic Detection (Always Active)
  long duration;
  int distance;
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;

  bool handDetected = (distance > 0 && distance < 15); // Adjust range as needed
  digitalWrite(LED2, handDetected ? HIGH : LOW);

  // 4. IR Counting (Only when System is ON)
  if (systemOn) {
    bool currentIRState = digitalRead(IR_PIN);
    if (lastIRState == HIGH && currentIRState == LOW) { // Active Low
      objectCount++;
    }
    lastIRState = currentIRState;
  }

  // 5. Serial UI
  if (millis() - lastUpdate > 500) {
    Serial.println("\n=========================");
    Serial.print(" SYSTEM: "); Serial.println(systemOn ? "[ ON ]" : "[ OFF ]");
    Serial.print(" COUNT : "); Serial.println(objectCount);
    Serial.print(" PROX  : "); Serial.println(handDetected ? "!!! WARNING !!!" : "SAFE");
    Serial.println("=========================");
    lastUpdate = millis();
  }
}
