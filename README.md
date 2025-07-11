# 🔒 SSRF Lab – Real-World Bypasses for Modern Defenses

This lab simulates how Server-Side Request Forgery (SSRF) vulnerabilities bypass common code-level defenses. It walks developers through:

* 5+ realistic defense implementations
* Real-world payloads that bypass each defense
* An interactive terminal-style UI to test, learn, and iterate
* Optional AWS metadata emulation for cloud-realistic attacks

---

## 🧠 Project Philosophy

> “There’s no bulletproof SSRF fix at the code level.”

This lab **proves** that. While developers often rely on regex filters, DNS checks, or redirect blocking, these defenses are fragile and bypassable.

To secure services against SSRF, you must combine:

* ✅ Network segmentation
* ✅ Metadata access controls
* ✅ Header validation
* ✅ DNS hardening
* ✅ Application-layer isolation

---

## 💪 Requirements

* [AWS EC2 Metadata Mock](https://github.com/aws/amazon-ec2-metadata-mock) (Docker)
* Node.js and npm
* Admin/sudo privileges (to bind to port 80 and route metadata IPs)

---

## 🌐 Why Route to `169.254.169.254`?

In AWS, GCP, and Azure, the metadata service lives at `http://169.254.169.254/`. This lab simulates that by running a mock metadata server on the **same IP**, allowing you to test realistic payloads like:

```
http://2852039166/                       # Decimal
http://169.254.169.254.nip.io/           # DNS
http://[::ffff:169.254.169.254]/         # IPv6
http://0xa9fea9fe/                       # Hex
```

These **will not work** unless `169.254.169.254` is routed locally — which this lab sets up.

---

## 🚀 Installation

### Step 1: Setup AWS Metadata Mock Service

#### 🏧 Linux / 🍎 macOS:

```bash
# Add IP alias for metadata
sudo ifconfig lo0 alias 169.254.169.254/32        # macOS
# or
sudo ip addr add 169.254.169.254/32 dev lo        # Linux

# Pull and run metadata mock server
docker pull public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
sudo docker run -it --rm -p 169.254.169.254:80:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0

# To run docker container with V2 IMDS ONLY
sudo docker run -it --rm -p 169.254.169.254:80:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0 --imdsv2 
```

#### 🪠 Windows:

```powershell
# Run PowerShell as Administrator

# Add loopback IP
netsh interface ip add address "Loopback Pseudo-Interface 1" 169.254.169.254 255.255.255.255

# Setup port proxy
netsh interface portproxy add v4tov4 listenaddress=169.254.169.254 listenport=80 connectaddress=127.0.0.1 connectport=1338

# Start metadata service
docker pull public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
docker run -it --rm -p 1338:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0

# To run docker container with V2 IMDS ONLY
docker run -it --rm -p 1338:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0 --imdsv2 
```

💪 Test it:

```bash
curl http://169.254.169.254/latest/meta-data/
```

🚽 Cleanup (Windows only):

```powershell
netsh interface portproxy delete v4tov4 listenaddress=169.254.169.254 listenport=80
netsh interface ip delete address "Loopback Pseudo-Interface 1" 169.254.169.254
```

---

### Step 2: Start the SSRF Lab

```bash
npm install
node app.js
```

---

## 💻 Access the Lab

> [http://localhost:3000/](http://localhost:3000/)

Try entering:

```
http://169.254.169.254/latest/meta-data/
```

...in the **"No Defense"** tab and watch metadata leak!

---

## 🪨 Defense Scenarios Covered

Each tab represents a real-world SSRF mitigation — and its bypass:

| Tab                             | Defense Technique              | Bypass Exploit                     |
| ------------------------------- | ------------------------------ | ---------------------------------- |
| 🔓 No Defense                   | None                           | Direct metadata access             |
| 🛡️ IP Blacklisting             | StartsWith / regex checks      | Encodings, IPv6, obfuscation       |
| 📁 Library Filters              | `isPrivateIP()` or URL checks  | DNS pinning                        |
| 📡 DNS Resolution               | Resolved IP checking           | Redirect to internal after pass    |
| ⏱️ TOCTOU / No Redirect Follows | Pre-check + axios redirect off | DNS rebinding                      |
| 🔐 IMDSv2 protection Bypass     | Blocking Metadata IP           | SSRF Chaining Attack |

---

## 📊 Troubleshooting

| Issue                            | Fix                                                 |                         |
| -------------------------------- | --------------------------------------------------- | ----------------------- |
| ❌ "Permission denied on port 80" | Use `sudo` or run terminal as Administrator         |                         |
| ⚠️ "Can't bind" (Windows)        | Ensure portproxy setup and admin privileges         |                         |
| 🔍 "Connection refused"          | Check if metadata service is running and accessible |                         |
| 🚧 Port already in use           | \`netstat -ano                                      | findstr :80\` (Windows) |

---

## 💾 Postman Collection (Optional)

Explore SSRF payloads and bypasses using the pre-built Postman collection:
**`Postman Collection/SSRF-Demo.postman_collection.json`**

This includes:

* Pre-filled requests for each lab tab
* Payload commentary
* Defense breakdowns

---

## ✨ Lab Status

✅ **Phase 1 Complete**:

* All major SSRF defenses implemented and bypassed

🔄 **Phase 2 Planned**:

* Header Injection bypasses
* Lambda container edge cases
* SSRF-to-RCE chaining scenarios

---

Made with ❤️ by [@rahuldhawan291](https://www.linkedin.com/in/rahuldhawan291/)

```
```
