const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('C:\\Users\\zapat\\.gemini\\antigravity\\brain\\61f5d169-4011-4549-8c89-dceda88ab3ab\\.tempmediaStorage\\89bc6b1bc79f28f8.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_text.txt', data.text);
    console.log("PDF parsed successfully.");
}).catch(err => {
    console.error(err);
});
