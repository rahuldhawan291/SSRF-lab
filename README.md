# SSRF-lab

In this Lab, there are four types of defense mechanisms available for developers to address the SSRF issue. However, each of these mitigations can be bypassed by more sophisticated techniques. The bypass methods range from basic encoding of private IP addresses to advanced techniques such as DNS rebinding or Time-of-Check to Time-of-Use (TOCTOU)

## Requirements
* [AWS Metadata Mock service](https://github.com/aws/amazon-ec2-metadata-mock) (via Docker)
* Node.js and npm
* Administrator/sudo access (for port 80 binding)

## Why AWS Metadata Mock service?
The objective of this laboratory exercise is to circumvent the defense mechanism implemented for SSRF in order to gain access to the internal service. To make this lab realistic, I tried to use [AWS Metadata Mock service](https://github.com/aws/amazon-ec2-metadata-mock). You have the option to set up a simulated version of the metadata service on your local system. After installation, navigate to the lab's user interface (UI) and try accessing the metadata endpoint directly from within the UI.

## Why IP Routing to 169.254.169.254?
In real cloud environments (AWS, GCP, Azure), the metadata service is always accessible at `169.254.169.254`. If we simply run the service on `localhost` or `127.0.0.1`, many of the SSRF bypass techniques demonstrated in this lab wouldn't work realistically.

For example, these bypass payloads are specifically crafted for `169.254.169.254`:
- `http://2852039166/` (decimal encoding of 169.254.169.254)
- `http://0xa9fea9fe/` (hex encoding of 169.254.169.254)
- `http://169.254.169.254.nip.io/` (DNS bypass)
- `http://[::ffff:169.254.169.254]/` (IPv6 representation)

By configuring your system to route `169.254.169.254` to the metadata mock service, you get an authentic SSRF testing experience that mirrors real-world cloud environments.

## Installation

### Step 1: Setup AWS Metadata Mock Service

#### For Linux/Mac Users:
```bash
# Add IP alias to loopback interface
sudo ifconfig lo0 alias 169.254.169.254/32  # Mac
# OR
sudo ip addr add 169.254.169.254/32 dev lo   # Linux

# Run the metadata service (requires sudo for port 80)
docker pull public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
sudo docker run -it --rm -p 169.254.169.254:80:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
```

#### For Windows Users:
Windows requires additional network configuration to properly route traffic to 169.254.169.254.

1. **Open Command Prompt or PowerShell as Administrator**

2. **Configure Windows networking:**
   ```batch
   REM Add the metadata IP to loopback adapter
   netsh interface ip add address "Loopback Pseudo-Interface 1" 169.254.169.254 255.255.255.255

   REM Create port forwarding rule
   netsh interface portproxy add v4tov4 listenaddress=169.254.169.254 listenport=80 connectaddress=127.0.0.1 connectport=1338
   ```

3. **Run the metadata service:**
   ```batch
   docker pull public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
   docker run -it --rm -p 1338:1338 public.ecr.aws/aws-ec2/amazon-ec2-metadata-mock:v1.13.0
   ```

4. **Verify setup:**
   ```batch
   REM This should return metadata
   curl http://169.254.169.254/latest/meta-data/
   ```

**To clean up after the lab (Windows):**
```batch
netsh interface portproxy delete v4tov4 listenaddress=169.254.169.254 listenport=80
netsh interface ip delete address "Loopback Pseudo-Interface 1" 169.254.169.254
```

### Step 2: Start the SSRF Lab

In a new terminal:
```bash
npm install
node app.js
```

## Accessing the UI

```
http://localhost:3000/
```

## Testing the Setup

Once both services are running, you should be able to:
1. Access the lab at `http://localhost:3000/`
2. Try the payload `http://169.254.169.254/latest/meta-data/` in the "No Defense" section
3. See actual AWS-style metadata responses

## Troubleshooting

### Windows: "Can't bind to specified endpoint" error
- Make sure you ran the netsh commands as Administrator
- Check if another service is using port 80: `netstat -ano | findstr :80`

### "Connection refused" errors
- Ensure the metadata mock service is running
- Verify the IP configuration with `ipconfig /all` (Windows) or `ifconfig` (Linux/Mac)

### Port 80 permission denied
- On Linux/Mac, use `sudo` when running the docker command
- On Windows, run as Administrator

## Using Postman Collection
To gain a comprehensive understanding of the bypass techniques for each defense mechanism, you can utilize the provided Postman Collection located [here](Postman%20Collection/SSRF-Demo.postman_collection.json). This collection serves as a valuable resource for comprehending the intricacies and rationale behind each defense and its potential bypass. 

The detailed documentation within the collection explains the defenses, their corresponding bypasses, and even includes relevant payload examples. Consider this collection as a comprehensive solution guide for completing this lab successfully.

**PS: Note that this laboratory is currently a work in progress.**