const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const _ = require("lodash");

const date = require(__dirname + "/date.js");  
app.set('view engine', 'ejs');    // telling app to use ejs
app.use(express.static("public"));

const mongoose = require("mongoose");

//using our mongodb database directly
// mongoose.connect('mongodb://127.0.0.1:27017/todolistDb', {useNewUrlParser: true, useUnifiedTopology: true})
// .then( ()=> console.log("connection successfully"))
// .catch( (err)=> console.log(err))

//using Atlas database
mongoose.connect("mongodb://127.0.0.1:27017/todolistDb?readPreference=primary&ssl=false&directConnection=true", {useNewUrlParser: true, useUnifiedTopology: true})
.then( ()=> console.log("connection successfully"))
.catch( (err)=> console.log(err))

const itemsSchema = {
    name: String
};
const Item = mongoose.model('Item', itemsSchema);

//var items = ["Buy food", "Watch anime", "Time Pass"];  // creating a array for items
//var workItems = [];

let day = date.getdate();

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "hit the + button to add a new item"
});
const item3 = new Item({
    name:"<-- Hit this to delete an item"
});

const defaultItems= [item1,item2,item3];
// Item.insertMany(defaultItems);

//new schema for custom list
const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){


    Item.find({})
        .then((foundItem) => {
            if(foundItem.length === 0){
                Item.insertMany(defaultItems)
            }
            else{
                res.render("list", {listTitle: day, newListItem: foundItem});
            }
        })
    });
    

app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    //to check the listname that triggers the post route is default list
    if(listName=== day){
        item.save();
        res.redirect("/");
    }
    //if list name is different(i.e, custom list) then find the list and save new item there
    else{
        List.findOne({name: listName})
            .then((foundList) =>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" +listName)
            })
    }
 

});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;

    const listName= req.body.listName;

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId)
    .then((data)=>{
        console.log("Successfully deleted the item");
        res.redirect("/");
      }).catch((err)=>{
        console.log(err);
      })
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then((foundList) => {
                res.redirect("/" +listName)
            })
    }

    
});

app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);

    //to find whether the custom list exist or not
    List.findOne({name: customListName})
    .then((foundList) => {
        if(!foundList){
            //if list doesnt exist then it create a new list
            //create a new schema - listSchema
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }
        else{
            //show an existing list
            res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
        }
    })
    
})


// app.get("/work", function(req,res){
//     res.render("list", {listTitle: "Work List", newListItem: workItems });
// });

app.get("/about", function(req,res){
    res.render("about");
});


app.listen(3000, function(){
    console.log('server running at port 3000');
});