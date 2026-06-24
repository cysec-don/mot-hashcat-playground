#!/usr/bin/env python3
"""Comprehensive end-to-end test of all critical flows.
Tests: register, login, dashboard, challenges, progress, playground, certificate, verify, admin."""
import json
import subprocess
import time
import sys
import os

BASE = "http://localhost:3000"
TOKEN = None
CSRF = None
STUDENT_NAME = "E2E Test User"
results = []

def curl(method, path, headers=None, data=None, expect_json=True):
    cmd = ["curl", "-s", "-X", method, "-w", "\n%{http_code}", "--max-time", "15"]
    if headers:
        for k, v in headers.items():
            cmd.extend(["-H", f"{k}: {v}"])
    if data is not None:
        cmd.extend(["-d", data])
    cmd.append(f"{BASE}{path}")
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        output = r.stdout.strip()
        if "\n" in output:
            body, code = output.rsplit("\n", 1)
            return int(code), body
        return 0, output
    except Exception as e:
        return 0, str(e)

def record(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append((name, passed, detail))
    print(f"  [{'X' if passed else ' '}] {name}" + (f" -- {detail}" if detail else ""))

def wait(s):
    time.sleep(s)

print("=" * 60)
print("COMPREHENSIVE E2E TEST")
print("=" * 60)

# 1. Landing page loads
code, body = curl("GET", "/")
record("Landing page loads (200)", code == 200, f"got {code}")
wait(2)

# 2. Register
code, body = curl("POST", "/api/auth", {"Content-Type": "application/json"},
                  json.dumps({"action": "register", "fullName": STUDENT_NAME, "email": "e2e@test.io", "password": "Str0ng!Pass1"}))
try:
    j = json.loads(body)
    TOKEN = j.get("token")
    CSRF = j.get("csrf")
    record("Register new user", code == 200 and TOKEN and CSRF, f"code={code}")
except:
    record("Register new user", False, f"parse error: {body[:100]}")
wait(2)

# 3. Login with wrong password
code, body = curl("POST", "/api/auth", {"Content-Type": "application/json"},
                  json.dumps({"action": "login", "fullName": STUDENT_NAME, "password": "WrongPass1!"}))
record("Login wrong password rejected (401)", code == 401, f"got {code}")
wait(2)

# 4. Login with correct password
code, body = curl("POST", "/api/auth", {"Content-Type": "application/json"},
                  json.dumps({"action": "login", "fullName": STUDENT_NAME, "password": "Str0ng!Pass1"}))
try:
    j = json.loads(body)
    TOKEN = j.get("token", TOKEN)
    CSRF = j.get("csrf", CSRF)
    record("Login correct password", code == 200 and TOKEN, f"code={code}")
except:
    record("Login correct password", False, f"parse error: {body[:100]}")
wait(2)

# 5. Dashboard data
code, body = curl("GET", "/api/student", {"Authorization": f"Bearer {TOKEN}"})
record("Dashboard data loads (200)", code == 200, f"got {code}")
wait(2)

# 6. Challenges list
code, body = curl("GET", "/api/progress", {"Authorization": f"Bearer {TOKEN}"})
record("Progress list loads (200)", code == 200, f"got {code}")
wait(2)

# 7. Submit challenge 1 (correct answer: password)
code, body = curl("POST", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"challengeId": 1, "answer": "password", "hintsUsed": 0}))
try:
    j = json.loads(body)
    record("Submit challenge 1 correct", code == 200 and j.get("correct") == True, f"correct={j.get('correct')}")
except:
    record("Submit challenge 1 correct", False, f"parse error: {body[:100]}")
wait(2)

# 8. Submit challenge 1 again (already completed)
code, body = curl("POST", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"challengeId": 1, "answer": "password", "hintsUsed": 0}))
try:
    j = json.loads(body)
    record("Re-submit challenge 1 (already completed)", code == 200 and j.get("completed") == True, f"completed={j.get('completed')}")
except:
    record("Re-submit challenge 1", False, f"parse error: {body[:100]}")
wait(2)

# 9. Submit challenge 4 (identify type - correct option)
code, body = curl("POST", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"challengeId": 4, "answer": "-a 0 — Straight (dictionary / wordlist)", "hintsUsed": 0}))
try:
    j = json.loads(body)
    record("Submit challenge 4 (identify)", code == 200 and j.get("correct") == True, f"correct={j.get('correct')}")
except:
    record("Submit challenge 4", False, f"parse error: {body[:100]}")
wait(2)

# 10. Submit challenge 1 wrong answer
code, body = curl("POST", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"challengeId": 2, "answer": "wronganswer", "hintsUsed": 0}))
try:
    j = json.loads(body)
    record("Submit challenge 2 wrong answer", code == 200 and j.get("correct") == False, f"correct={j.get('correct')}")
except:
    record("Submit challenge 2 wrong", False, f"parse error: {body[:100]}")
wait(2)

# 11. PATCH hint usage
code, body = curl("PATCH", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"challengeId": 1}))
record("PATCH hint usage (200)", code == 200, f"got {code}")
wait(2)

# 12. Playground session
code, body = curl("POST", "/api/playground",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"hashType": "MD5", "attackMode": "Straight", "command": "hashcat -m 0 -a 0 hash.txt", "duration": 5, "recovered": True}))
try:
    j = json.loads(body)
    record("Playground session logged", code == 200 and j.get("ok") == True, f"got {code}")
except:
    record("Playground session", False, f"parse error: {body[:100]}")
wait(2)

# 13. Leaderboard
code, body = curl("GET", "/api/leaderboard?limit=10")
try:
    j = json.loads(body)
    has_lastactive = "lastActiveAt" in body
    record("Leaderboard loads + no lastActiveAt", code == 200 and not has_lastactive, f"got {code}")
except:
    record("Leaderboard", False, f"parse error: {body[:100]}")
wait(2)

# 14. Certificate (should fail - not all challenges complete)
code, body = curl("POST", "/api/certificate",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  "{}")
record("Certificate blocked (not complete)", code == 400, f"got {code}")
wait(2)

# 15. Public verify (should fail - no cert)
code, body = curl("GET", "/api/verify/MOT-FAKE0000")
try:
    j = json.loads(body)
    record("Verify fake cert rejected", code == 200 and j.get("valid") == False, f"valid={j.get('valid')}")
except:
    record("Verify fake cert", False, f"parse error: {body[:100]}")
wait(2)

# 16. CSRF protection - POST without CSRF
code, body = curl("POST", "/api/progress",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
                  json.dumps({"challengeId": 1, "answer": "password"}))
record("CSRF: POST without token rejected (403)", code == 403, f"got {code}")
wait(2)

# 17. Admin access (non-admin should be 403)
code, body = curl("GET", "/api/admin?action=students", {"Authorization": f"Bearer {TOKEN}"})
record("Admin access blocked for non-admin (403)", code == 403, f"got {code}")
wait(2)

# 18. Logout
code, body = curl("POST", "/api/auth",
                  {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}", "X-CSRF-Token": CSRF},
                  json.dumps({"action": "logout"}))
record("Logout (200)", code == 200, f"got {code}")
wait(2)

# 19. Token invalidated after logout
code, body = curl("GET", "/api/student", {"Authorization": f"Bearer {TOKEN}"})
record("Token invalidated after logout (401)", code == 401, f"got {code}")

# Summary
print()
print("=" * 60)
passed = sum(1 for _, p, _ in results if p)
failed = sum(1 for _, p, _ in results if not p)
print(f"RESULTS: {passed}/{len(results)} passed, {failed} failed")
print("=" * 60)
if failed > 0:
    print("\nFailed tests:")
    for name, p, detail in results:
        if not p:
            print(f"  - {name}: {detail}")
sys.exit(0 if failed == 0 else 1)
