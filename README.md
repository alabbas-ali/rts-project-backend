# RTS Project Backend
This is a FreeRTOS back-end project for Real-Time Railway Train Dispatching Simulation

# INTRODUCTION
A railway system consists of a network of tracks, set of trains, list of stations, and safety devices (signals, sensors, etc). Json-Schema is used to describe the structure of the document containing the railway network structure. The Json file is rail-map element which contains all other elements defines a railway network. The following types of railway elements are defined gate, connectionGate, segment, signal, switch and sensor Each element has a unique id.
Moving trains and controlling structure states inside the network are accomplished by the simulator engine using the TrainMove and CollisionDetection modules.
The simulator engine accesses the internal data and alters the state of the network through a set of function defined in the following modules: StructureQuer, DataTransformtion, SingalReceive and SignalApply. Signal is a message transmission between Simulation and Controller ( Controller is process in FreeRTOS ).
When a train reach the border of the network controlled by a simulator it will calculated taking into account the following aspects: the dynamic train characteristics and the current status of the railway objects (the state of signals, semaphores and switches).
The CollisionDetection implements an algorithm for detecting collision between trains which are moving on the same segment.
