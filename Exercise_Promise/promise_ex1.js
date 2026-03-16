// 1

console.log("Shabab Program Started ...")

// 2

const promise_dyal_ana = new Promise((resolve)=>{
    setTimeout(()=>{
        resolve();
    } , 3000);
});

//3 

console.log(promise_dyal_ana)

// 4

console.log("Program in progress...");

// 5

promise_dyal_ana.then(() => {
  console.log("Program complete");
});
