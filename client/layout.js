Template.header.events({
  'click #search': function(event){
    event.preventDefault()
    var queryText = $("#queryText").val()
    query("text", {queryText: queryText})
  },
  'keypress #queryText': function(event){
    if (event.charCode == 13) {
        var queryText = $("#queryText").val()
        query("text", {queryText: queryText})
        event.preventDefault()
    }
  },
  'click #showAll': function(){
    event.preventDefault()
    query("all", {})
  },
  
  'click #dimAll': function(){
    event.preventDefault()
    Meteor.call('dimAll')
  },
})