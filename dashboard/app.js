const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.end('<h1>123</h1>');
});

app.listen(PORT, () => console.log(`Port — ${PORT}`));