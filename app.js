//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require ("mongoose");
const _ =require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-hiba:test123@cluster0.djc9e.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true}  )
const itemsSchema={
  name: String,
};
const Item=mongoose.model("Item", itemsSchema );

const item1= new Item({
name: " Welcome to to do list"
});

const item2= new Item({
name: " please add new items"
});

const item3= new Item({
name: "you can also delete other items"
});

const defaultArray=[item1, item2, item3];



const listSchema={
  name: String,
  items:[itemsSchema]
};
const List= mongoose.model("List", listSchema);







app.get("/", function(req, res) {
Item.find({}, function(err, foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultArray, function(err){
      if(err){console.log(err);}
      else{ console.log("successfully added");}
    });
    res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;



  const item=new Item({name: itemName
  }  );
  if (listname==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    })
  }


});


app.post("/delete", function(req,res){
  const checkboxID= req.body.Checkbox;
  const listNamedelete = req.body.deleteinput;

if (listNamedelete==="Today") {
  Item.findByIdAndRemove(checkboxID, function(err){
    if(!err){
      console.log("successfully removed");
      res.redirect("/");
}

});
}

else{

List.findOneAndUpdate({name:listNamedelete}, {$pull:{items:{_id:checkboxID}}}, function(err, foundList){
  if(!err){
    res.redirect("/"+listNamedelete);
  }
});

}

});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListname", function(req,res){
  const customListname=_.capitalize(req.params.customListname);


    List.findOne({name:customListname}, function(err, foundList){
      if (!err)
      {
        if(!foundList)
        {
          const list= new List({
            name:customListname,
            items:defaultArray });
        list.save();
        res.redirect("/"+customListname);
      }
       else {
  res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }


}
});
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
