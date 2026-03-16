// 1
console.log("Program started");

// 2
const PromiseLowla = new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 3000);
});

// 3
console.log(PromiseLowla);

// 4
console.log("Program in progress...");

// 5
PromiseLowla
  .then(() => {
    console.log("Step 1 complete");

    //  6
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Step 2 complete");
      }, 3000);
    });
    // 7
  })
  .then((message) => {
    console.log(message);
  });