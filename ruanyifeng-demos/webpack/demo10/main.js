import("./a").then(module => {
    document.open();
    document.write('<h1>' + module || module.default + '</h1>');
    document.close();
}).catch(err => {
    console.log("Chunk loading failed");
});

// require.ensure(['./a'], function(require) {
  // var content = require('./a');
  // document.open();
  // document.write('<h1>' + content + '</h1>');
  // document.close();
// });
