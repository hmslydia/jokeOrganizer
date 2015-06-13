/*
Template.sidebar.helpers({
  tags: function(){
    
  }
  
})
*/

Template.sidebar.events({
  'click .sidebar-tag': function(event){
    query("tag", 
      {
        tag_id: this._id,
        tagText: this.tag
      }
    )
  }
})