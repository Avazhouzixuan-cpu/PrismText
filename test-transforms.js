// Quick test of ToneCalibratorV2 transformations
const text = "Hey, I think we should get everyone together and using our new approach. Thanks for your help!";
console.log("ORIGINAL:", text);

// Test applyFormalityTransforms
let result = text;

// Simulate very formal (level > 70)
result = result.replace(/I think/gi, 'In my assessment');
console.log("After formality replacement:", result);

result = result.replace(/but/gi, 'however');
result = result.replace(/get/gi, 'obtain');
result = result.replace(/using/gi, 'utilizing');
console.log("After more formality:", result);

// Test emotional
result = result.replace(/\./g, '. 😊');
console.log("After emotional:", result);

// Test urgency
if (!text.match(/urgent|asap|immediately/gi)) {
    result = result.replace(/\.$/, '. This requires immediate attention.');
}
console.log("After urgency:", result);

// Test directness
result = result.replace(/perhaps|maybe|might|could/gi, 'should');
console.log("After directness:", result);

console.log("\nFINAL:", result);
console.log("Final length:", result.length);
