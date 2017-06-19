var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//============
// COMMENTS ROUTES
//============
router.get("/new",middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: campground});
        }
    })
});
//COMMENT EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnerShip, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else{
            res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});    
       }
    });
    
});
//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnerShip, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})
//Comment create
router.post("/",middleware.isLoggedIn, middleware.checkCommentOwnerShip, function(req, res){
    //look up campground using ID
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "Some thing went wrong!!");
                   console.log(err);
                 }else{
                     //add username and id to the new comment
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     //save comeent
                     comment.save();
                     campground.comments.push(comment);
                     campground.save();
                     req.flash("success","Successfully created comment!");
                     res.redirect("/campgrounds/" + campground._id);
                 }
           })
       }
    });
    //create new comment
    //connect new comment to campground
    //redirect to campground show page
})
//COMMENT Destroy route
router.delete("/:comment_id",middleware.checkCommentOwnerShip, function(req, res){
    //findById
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Your comment is deleted!");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
});

module.exports = router;