# RTS Project Backend
This is a FreeRTOS back-end project for Real-Time Railway Train Dispatching Simulation

### What is this repository for? ###

The project is Java Spring Boot project based on Spring MVC, JSP, And Websockets.
A railway system consists of a network of tracks, set of trains, list of stations, and safety devices (signals, sensors, etc). Json-Schema is used to describe the structure of the document containing the railway network structure. The Json file is rail-map element which contains all other elements defines a railway network. The following types of railway elements are defined gate, connectionGate, segment, signal, switch and sensor Each element has a unique id.
Moving trains and controlling structure states inside the network are accomplished by the simulator engine using the TrainMove and CollisionDetection modules.
The simulator engine accesses the internal data and alters the state of the network through a set of function defined in the following modules: StructureQuer, DataTransformtion, SingalReceive and SignalApply. Signal is a message transmission between Simulation and Controller ( Controller is process in FreeRTOS ).
When a train reach the border of the network controlled by a simulator it will calculated taking into account the following aspects: the dynamic train characteristics and the current status of the railway objects (the state of signals, semaphores and switches).
The CollisionDetection implements an algorithm for detecting collision between trains which are moving on the same segment.

Version 1.0.0

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

- Java sdk 1.8 ( http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html ) 

please config the environment path  

- Eclipse Jee Oxygen ( http://www.eclipse.org/downloads/download.php?file=/technology/epp/downloads/release/oxygen/1a/eclipse-jee-oxygen-1a-win32-x86_64.zip )

please after installing Eclipse go to Marketplace and install Spring Tools ( aka Spring IDE and Spring Tool Suite )

Run The project command line :
    
    > mvn spring-boot:run

Run The Eclipse :

Right-click in the project > Run As > Maven Install
Right-click in the project > Run As > Spring Boot App

open your browser and go to http://localhost:8080/
