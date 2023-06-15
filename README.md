# SSRF-lab

In this Lab, there are four types of defense mechanisms available for developers to address the SSRF issue. However, each of these mitigations can be bypassed by more sophisticated techniques. The bypass methods range from basic encoding of private IP addresses to advanced techniques such as DNS rebinding or Time-of-Check to Time-of-Use (TOCTOU)

## Requirements
* [AWS Metadata Mock service](https://github.com/aws/amazon-ec2-metadata-mock)

***Why AWS Metadata Mock service?***
The objective of this laboratory exercise is to circumvent the defense mechanism implemented for SSRF in order to gain access to the internal service. To make this lab realistic, I tried to use [AWS Metadata Mock service](https://github.com/aws/amazon-ec2-metadata-mock). You have the option to set up a simulated version of the metadata service on your local system. After installation, navigate to the lab's user interface (UI) and try accessing the metadata endpoint directly from within the UI.

## Installation

```
npm install
node app.js
```

## Accessing the UI

```
http://localhost:3000/
```

## Using Postman Collection
To gain a comprehensive understanding of the bypass techniques for each defense mechanism, you can utilize the provided Postman Collection located [this](Postman%20Collection/SSRF-Demo.postman_collection.json). This collection serves as a valuable resource for comprehending the intricacies and rationale behind each defense and its potential bypass. 

The detailed documentation within the collection explains the defenses, their corresponding bypasses, and even includes relevant payload examples. Consider this collection as a comprehensive solution guide for completing this lab successfully.


**PS: Note that this laboratory is currently a work in progress.**



