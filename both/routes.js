Router.map(function(){
  this.route('home', { 
    path: '/',
    layoutTemplate: 'standardLayout',
    yieldTemplates: {
      'header': {to: 'header'}
    },
    waitOn: function(){         
      return [Meteor.subscribe('comments'),     
              Meteor.subscribe('articles'),
              Meteor.subscribe('voices'),
              Meteor.subscribe('likerts'),
              Meteor.subscribe('tags'),
              Meteor.subscribe('tagCountsByObject'),
              Meteor.subscribe('tagApplications'),
              Meteor.subscribe('likertApplications')]
    },
    data: function(){
      /*
      var queryType = Session.get('queryType')
      var queryTagId = Session.get('queryTagId')
      var queryText = Session.get('queryText')
      
      console.log("route: "+queryTagId)
      
      var articles = []
      
      if( !queryType ){
        articles = Articles.find().fetch()
      } else if (queryType == "all"){
        articles = Articles.find().fetch()
      } else if (queryType == "tag"){
        var articleIds = _.unique(_.pluck(TagApplications.find({tag_id: queryTagId}).fetch(), "article_id"))
        articles = Articles.find({_id: { $in: articleIds }}).fetch()
      }
      
      
      for (var i = 0; i < articles.length; i++) {
        var articleObj = articles[i]
        var article_id = articleObj._id
        
        var articleComments = Comments.find({article_id: article_id}).fetch()        
        articleObj.headline_comments = _.filter(articleComments, function(obj){ return obj.field == "headline"})
        articleObj.description_comments = _.filter(articleComments, function(obj){ return obj.field == "description"})
        articleObj.voice1_comments = _.filter(articleComments, function(obj){ return obj.field == "voice1"})
        articleObj.voice2_comments = _.filter(articleComments, function(obj){ return obj.field == "voice2"})
        articleObj.voice3_comments = _.filter(articleComments, function(obj){ return obj.field == "voice3"})
        
        var articleTagApplications = TagApplications.find({article_id: article_id}).fetch()        
        articleObj.headline_tags = _.filter(articleTagApplications, function(obj){ return obj.field == "headline"})
        articleObj.description_tags = _.filter(articleTagApplications, function(obj){ return obj.field == "description"})
        articleObj.voice1_tags = _.filter(articleTagApplications, function(obj){ return obj.field == "voice1"})
        articleObj.voice2_tags = _.filter(articleTagApplications, function(obj){ return obj.field == "voice2"})
        articleObj.voice3_tags = _.filter(articleTagApplications, function(obj){ return obj.field == "voice3"})
      }
      */
      var tags = Tags.find({}, {}).fetch()
      
      return {
          //articles: articles, 
          tags: tags
        }
        
    },
    action: function(){
      if(this.ready()){
        this.render()
      }
    }
  })
})