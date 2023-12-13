const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

// var items = ["Buy Food","Cook Food","Eat Food"];
var workItems = [];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

// mongoose.connect("mongodb+srv://shahrukhqureshi017:test123@cluster0.dpshbpu.mongodb.net/todolistDB");
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
    name:String,
}

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name:"Welcome to your todolist"
});

const item2 = new Item({
    name:"Hit the + button to add a new item."
});

const item3 = new Item({
    name:"<-- Hit this to delete an item."
}); 


const defaultItem = [item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){


// var today = new Date();
// var options = {
//     weekday:"long",
//     day:"numeric",
//     month:"long"
// };
// var day = today.toLocaleDateString("en-Us",options);

Item.find({}).then(function(findItems){

    if(findItems.length == 0){
        Item.insertMany(defaultItem);
        res.redirect("/");
    }
    else{
    res.render("list",{listTitle:"Today",newListItem:findItems});
    }
});
});


app.post("/",function(req,res){
//     var item = req.body.input;
//    if(req.body.list === "Work"){
//     workItems.push(item);
//     res.redirect("/work");
//    }
//    else{
//     items.push(item);
//     res.redirect("/");
// }

const itemName = req.body.input;
const listName = req.body.list;

const item = new Item({
    name :itemName,
});

if(listName === "Today"){
    item.save();
    res.redirect("/");
}
else{
    List.findOne({name:listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
}
});

// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"Work List",newListItem:workItems});
//     });
    
    // app.post("/work",function(req,res){
    //     var item = req.body.input;
    //     workItems.push(item);  
    //     res.redirect("/work");
    // });

    app.get("/:customListName",function(req,res){
        const customListName = _.capitalize(req.params.customListName);

        List.findOne({name:customListName}).then(function(foundList){

            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItem,
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
             res.render("List",{listTitle:foundList.name,newListItem:foundList.items});
            }
        });
    });


    app.get("/about",function(req,res){
        res.render("about");
    });

    app.post("/delete",function(req,res){
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if(listName === "Today"){
            Item.findByIdAndRemove(checkedItemId).then(function(){
                // if(!err){
                console.log("Successfully deleted the item");
                res.redirect("/");
                // }
            });  
        }
            else{
                List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
                    res.redirect("/" + listName);
                });
            }   
    });

app.listen(3000,function(req,res){
console.log("Server is running on port 3000");
}); 
