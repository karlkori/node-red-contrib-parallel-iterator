/**
 * Copyright 2016 mcarboni@redant.com
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/



 module.exports = function(RED) {
    'use strict';

    function IteratorNode(n) {

        RED.nodes.createNode(this, n);
        this.property = n.property;
        this.saveOutput = n.saveOutput;
        this.recursive = n.recursive;
        this.storeId = n.storeId;

        var propertyParts = n.property.split('.'),
            node = this;

            //For multiple flows at the same time
            var flow_id = 0,
                flow_processing = {},
                flow_outputs = {};

            //Variables internals to the node, really usefull if on this node there's only one flow at time
            var _processing = [],
                _outputs = [];

        function onInput(_msg) {
            var msg = RED.util.cloneMessage(_msg);
            //Find the property specified in the config
            var prop = propertyParts.reduce(function (obj, i) {
                return (typeof obj === 'object')
                        ? obj[i]
                        : obj;
            }, msg);

            var processing,outputs,actually_processing;

            //In the case the id of the flow needs to be stored in the msg
            if ( node.storeId ) {
                var id;
                //Set if is a feedback
                actually_processing  = Array.isArray(msg.__serialIteratorId);
                //If is not processing and the input isn't an array, the data is invalid
                if (!actually_processing && !Array.isArray(prop) ) {
                    return ;
                }
                //Check if is a an input
                if (( node.recursive || !actually_processing  ) && Array.isArray(prop)) {
                    //New id
                    id = flow_id++;
                    flow_processing[id] = [];
                    flow_outputs[id]    = [];
                    //Add the id to the msg
                    if (!msg.__serialIteratorId) {
                        msg.__serialIteratorId = [];
                    }
                    msg.__serialIteratorId.unshift(id);
                } else {
                    //It's a feedback
                    id = msg.__serialIteratorId[0];
                }
                processing  = flow_processing[id];
                outputs     = flow_outputs[id];
            } else {
                //In case of only one flow at time
                actually_processing = processing.length;
                processing  = _processing;
                outputs     = _outputs;
            }

            //If the property is an Array then iterate over it
            if ( ( node.recursive || !actually_processing  ) && Array.isArray(prop) ) {
                //Save the array
                processing.unshift(prop.length);
                if ( node.saveOutput ) {
                    //Create an array to save the outputs from the feedback
                    outputs.unshift([]);
                }
                for (var i=0,l=prop.length;i<l;i++) {
                    var output = RED.util.cloneMessage(msg);
                    output.payload = prop[i];
                    output.$index  = i;
                    output.$last   = i === prop.length - 1;
                    output.$first  = i === 0;
                    //Send the data
                    node.send([output,null]);
                }
            } else {
                //In the opposite case it's a feedback
                if ( node.saveOutput ) {
                    //Save the output in an Array
                    outputs[0].push(msg.payload);
                }
                processing[0]--;
                if (!processing[0]) {
                    //Delete now useless data
                    processing.shift();
                    //Finished
                    if ( node.saveOutput ) {
                        //Set as payload the output
                        msg.payload = outputs[0];
                        outputs.shift();
                    }
                    if ( node.recursive && processing.length ) {
                        onInput(msg);
                    } else {
                        node.send([null,msg]);
                    }
                }
            }
        }

        this.on('input', onInput);
    }

    RED.nodes.registerType('Parallel Iterator',IteratorNode);
};
