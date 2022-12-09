let isFlushing = false;
let isFlushPending = false;

const p = Promise.resolve();
const queue = new Set();
const pendingPostFlushCbs = new Set();

function queueFlush(){
  if(!isFlushing && !isFlushPending){
    isFlushPending = true;
    Promise.resolve().then(() => {
      isFlushPending = false;
      isFlushing = true
      try {
        console.log(queue, pendingPostFlushCbs)
        queue.forEach(job => job());
      } finally {
        isFlushing = false;
        queue.clear();
        pendingPostFlushCbs.forEach(job => job())
        pendingPostFlushCbs.clear();
      }
    })
  }
}

export function queuePostFlushCb(cb){
  pendingPostFlushCbs.add(cb);
  queueFlush();
}

export function queueJob(job) {
  queue.add(job);
  queueFlush();
}

