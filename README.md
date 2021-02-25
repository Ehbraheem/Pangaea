# Pangaea BE Coding Challenge - Solution

## Setup Guide
A quick guide to setup the apps on your local machine

Clone auth repo
```sh

$ git clone https://github.com/Ehbraheem/Pangaea.git
$ cd pangaea
```
#### Install


```sh
$ pushd packages/subscriber && yarn install && popd
$ pushd packages/publisher && yarn install && popd
$popd
```

## Installation Guide
1. Install and Setup NodeJS according to your operating system --> [Official Documentation](https://nodejs.org/en/download/)

2. Install and Setup Redis server on your local machine according to your operating system --> [Official Documentation](https://redis.io/topics/quickstart)



## Application setup

To successfully run the applications, you need to follow the instructions below.

Start **redis** on your local machine on a separate terminal 

```sh
$ redis-server
```

## Start the Apps

```sh
$ chmod +x ./start-server.sh # Assumes you're running this in a Unix shell
$ ./start-server.sh
```