Node-red Parallel Iterator
========================


Install
-------

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-parallel-iterator

## Overview

Iterate over an Array received on the input, wait a feedback from all the sent elements before send an output on the second output


## Parallel Iterator

This node have 1 input and 2 outputs, the upper output is where is sent each element of the Array, the lower output is where is sent the output after all elements of the Array are processed.

Every element of the Array is sent as payload.

While the node is iterating over the Array he preserve the values of the properties that aren't payload.

The node have the following properties :

### Iterate over msg.

Is the property that contains the Array that you want to iterate, you can use a dot for access to deeper properties
Example :

    payload.response.items


## Output processed data

The data from each feedback is stored in an Array that is at the end passed as payload.

## Recursive

If this checkbox is checked then the node will check while iterating if the input is an Array, in positive case the node will start iterating over the new input, and after finishing the new iterations then continues with the previous input.
