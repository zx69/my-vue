function BinarySearchTree(){
  const Node = function(key){
    this.key = key;
    this.left = null;
    this.right = null;
  }

  this.root = null;
  
  const insertNode = function(node, newNode){
    if(newNode.key < node.key){
      if(node.left === null){
        node.left = newNode;
      }else{
        insertNode(node.left, newNode)
      }
    }else{
      if(node.right === null){
        node.right = newNode;
      }else{
        insertNode(node.right, newNode);
      }
    }
  }

  this.insert = function(key){
    let newNode = new Node(key);
    if(this.root === null){
      this.root = newNode;
    }else{
      insertNode(this.root, newNode)
    }
  }
}


// test;
let tree = new BinarySearchTree();

[11,7,15,5,3,9,8,10,13,12,14,20,18,25].forEach(key => {
  tree.insert(key);
})


function dump(node, indent = 0){
  console.log(`${'-'.repeat(indent)}${node.key}`);
  if(node.left){
    dump(node.left, indent +2);
  }
  if(node.right){
    dump(node.right, indent + 2);
  }
}
dump(tree.root);