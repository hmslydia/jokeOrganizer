 UI.registerHelper('equals', function (a, b) {
      return a === b;
    });
    
  UI.registerHelper('nonzero', function (a) {
      return a != 0;
    });   

Template.queryFeedback.helpers({
  queryFeedbackText : function() {
    var queryType = Session.get('queryType')
    
    var queryTagText = Session.get('queryTagText')
    var queryTagId = Session.get('queryTagId')
    var queryText = Session.get('queryText')
    var queryGoalType = Session.get('queryGoalType')
    var queryGoalSubtype = Session.get('queryGoalSubtype')
    var numResults = Session.get('numResults') || "Lots of"
    
    if( !queryType ){
      return numResults+ " results"
    } else if (queryType == "all"){
      return numResults+ " results for all articles"
    } else if (queryType == "tag"){
      return numResults+ " results for tag '"+queryTagText+"'"
    } else if (queryType == "text"){
      return numResults+ " results for '"+queryText+"'"
    } else if (queryType == "goal"){
      return numResults+ " results for '"+queryGoalType+"': '"+queryGoalSubtype+"'"
    }

  }
})


/*
A query determines which articles should be shown.
The default query is for "all" the articles

A tag, text, or goal option can trigger a new query.

There are two steps to:
1. Find the articles
2. Put extra information on it from joins with Comments, (Tags), Likerts.

*/
Template.articleDiv.helpers({
  articles : function(){
    var queryType = Session.get('queryType')
    var queryTagId = Session.get('queryTagId')
    var queryTagText = Session.get('queryTagText')
    var queryText = Session.get('queryText')
    var queryGoalType = Session.get('queryGoalType')
    var queryGoalSubtype = Session.get('queryGoalSubtype')
    
    var articles = []
    //var voices = []
    var showAllVoices = true
    var selectedArticleVoices = {} //{article_id: ["voice1", "voice2"]}// this keeps an index of which voices we want to actually show for each item
    
    //STEP 1. PROCESS THE QUERY TO FIND WHICH ARTICLES TO SHOW
    if( !queryType ){
      articles = Articles.find().fetch()
    
    } else if (queryType == "all"){
      articles = Articles.find().fetch()
    
    } else if (queryType == "tag"){
      showAllVoices = false
      var allTagApplications = TagApplications.find({tag_id: queryTagId}).fetch()
      var articleIds = _.unique(_.pluck(allTagApplications, "article_id"))
      articles = Articles.find({_id: { $in: articleIds }}).fetch()  
      console.log(queryTagText)  
      
      
      
      _.each(allTagApplications, function(tagApplicationObj){
        var article_id = tagApplicationObj.article_id
        var field = tagApplicationObj.field
        if(selectedArticleVoices.hasOwnProperty(article_id)){
          selectedArticleVoices[article_id].push(field)
        }else{
          selectedArticleVoices[article_id] = [field] 
        }        
      })
    
    
    
    } else if (queryType == "text"){
      //we are going to be using selectedArticleVoices to tell which voices to display
      showAllVoices = false
      
      //construct a regex for this text search
      var regex = new RegExp(queryText, "i")
      
      //find a unique set of article ids, with comments that match the regex
      var commentsMatchingRegex = Comments.find({text: regex, removed: false}).fetch()
      var articleIds = _.unique(_.pluck(commentsMatchingRegex, "article_id"))
      //also, get which voices they belong to. 
      
      _.each(commentsMatchingRegex, function(commentMatchingRegex){
        var article_id = commentMatchingRegex.article_id
        var field = commentMatchingRegex.field
        if (_.contains(["voice1", "voice2", "voice3"], field)){
          //insert this into selectedArticleVoices
          if(selectedArticleVoices.hasOwnProperty(article_id)){
            selectedArticleVoices[article_id].push(field)
          }else{
            selectedArticleVoices[article_id] = {}
            selectedArticleVoices[article_id] = [field] 
          }
        }
      })
      
      
      
      //
      var query = { $or: [ 
                            {_id: { $in: articleIds }}, //Regex Match In Comments
                            { headline: regex }, 
                            { description: regex }, 
                            {voice1: regex}, 
                            {voice2: regex} , 
                            { voice3: regex } 
                          ]}
      
      articles = Articles.find(query).fetch()
      articles = highlightSearchTermInArticles(articles, queryText)
      
      
      //UPDATE selectedArticleVoices
      var voice1_articles = Articles.find({voice1: regex}).fetch()
      var voice2_articles = Articles.find({voice2: regex}).fetch()
      var voice3_articles = Articles.find({voice3: regex}).fetch()
      
      _.each(voice1_articles, function(voice1_article){
        var article_id = voice1_article._id
        if(selectedArticleVoices.hasOwnProperty(article_id)){
          selectedArticleVoices[article_id].push("voice1")
        }else{
          selectedArticleVoices[article_id] = ["voice1"] 
        }        
      })
      _.each(voice2_articles, function(voice2_article){
        var article_id = voice2_article._id
        if(selectedArticleVoices.hasOwnProperty(article_id)){
          selectedArticleVoices[article_id].push("voice2")
        }else{
          selectedArticleVoices[article_id] = ["voice2"] 
        }        
      })
      _.each(voice3_articles, function(voice3_article){
        var article_id = voice3_article._id
        if(selectedArticleVoices.hasOwnProperty(article_id)){
          selectedArticleVoices[article_id].push("voice3")
        }else{
          selectedArticleVoices[article_id] = ["voice3"] 
        }        
      })     
      
    } else if (queryType == "goal"){
      if(queryGoalType == "insult"){

        var tagApps = TagApplications.find().fetch()
        var voices = _.groupBy(tagApps, function(app) {
          return app.article_id+"_"+app.field
        })
        
        //find the right subset of article ids
        var yes_ids = []
        var no_ids = []
        var unsure_ids = []
        _.each(voices, function(voiceObj){
          var tags = _.flatten( _.pluck(voiceObj, "tag"))
    
          var hasAnswer = false
          if( _.contains(tags, "#insult")){
            yes_ids.push(voiceObj[0].article_id)
            var hasAnswer = true
          }
          if( _.contains(tags, "#notInsult")){
            no_ids.push(voiceObj[0].article_id)
            var hasAnswer = true
          }
          if(hasAnswer == false){
            unsure_ids.push(voiceObj[0].article_id)
          }
        })
        
        //var regex = new RegExp(queryText, "i")
        var article_id_set = []
        if (queryGoalSubtype == "yes"){
          article_id_set = yes_ids
        }
        if (queryGoalSubtype == "no"){
          article_id_set = no_ids
        }
        if (queryGoalSubtype == "unsure"){
          article_id_set = unsure_ids
        }
        var articleIds = _.unique(article_id_set)
        var query = { _id: { $in: articleIds } }
        
        articles = Articles.find(query).fetch()
        articles = highlightSearchTermInArticles(articles, queryText)
      }
      
      //GOAL QUERY #2
      
      if(queryGoalType == "likert-two-stories"){  
        showAllVoices = false
        var query = {}
        if (queryGoalSubtype == "yes"){
          query = {"likert_two_stories_counts.yes": {$gt:0} }
        }
        if (queryGoalSubtype == "no"){
          query = {"likert_two_stories_counts.no": {$gt:0} }
        }
        if (queryGoalSubtype == "kinda"){
          query = {"likert_two_stories_counts.kinda": {$gt:0} }
        }
        if (queryGoalSubtype == "notDone"){
          query = {$and: [
            {"likert_two_stories_counts.yes": 0},
            {"likert_two_stories_counts.no": 0},
            {"likert_two_stories_counts.kinda": 0},
          ]}
        }
        
        var voicesObjs = Voices.find(query).fetch()
        var article_id_set = _.pluck(voicesObjs, "article_id")
        
        //make ranking function
        article_id_set_scores = {}
        //instantiate the scores to zero
        _.each(article_id_set, function(article_id){
          article_id_set_scores[article_id] = 0
        })
        _.each(voicesObjs, function(voiceObj){
          var article_id = voiceObj.article_id
          var score_inc = 0
          //based on the subquery, increment the score:
          if (queryGoalSubtype == "yes"){
            score_inc += voiceObj.likert_two_stories_counts.yes
          }
          if (queryGoalSubtype == "no"){
            score_inc += voiceObj.likert_two_stories_counts.no
          }
          if (queryGoalSubtype == "kinda"){
            score_inc += voiceObj.likert_two_stories_counts.kinda
          }
          if (queryGoalSubtype == "notDone"){
            //do nothing, they are all equally notDone
          }          
          
          article_id_set_scores[article_id] = article_id_set_scores[article_id] + score_inc
        })       
        var articleIds = _.unique(article_id_set)
        var articles_query = { _id: { $in: articleIds } }
        articles = Articles.find(articles_query).fetch()
        
        //SORT BY MOST YES / NO / KINDA
        articles = _.sortBy(articles, function(article){  return article_id_set_scores[article._id] * -1 })
        
        
        _.each(voicesObjs, function(voicesObj){
          var article_id = voicesObj.article_id
          var voice = voicesObj.voice_number
          if(selectedArticleVoices.hasOwnProperty(article_id)){
            selectedArticleVoices[article_id].push(voice)
          }else{
            selectedArticleVoices[article_id] = [voice] 
          }        
        })
      } 
    }
    
    //STEP 2. FOR EACH ARTICLE, PUT ALL THE JOIN dATA ON IN (comments, likerts, etc)
    //console.log("selectedArticleVoices")
    //console.log(selectedArticleVoices)
    for (var i = 0; i < articles.length; i++) {
      var articleObj = articles[i]
      var article_id = articleObj._id
      
      //ADD COMMENTS TO ARTICLES
      var articleComments = Comments.find({article_id: article_id, removed: false}).fetch() 
      if(queryType == "text"){
        articleComments =      highlightSearchTermInComments(articleComments, queryText)
      }
      
      if(queryType == "tag"){
        articleComments =      highlightSearchTermInComments(articleComments, queryTagText)
      }
      articleObj.headline_comments = _.filter(articleComments, function(obj){ return obj.field == "headline"})
      articleObj.description_comments = _.filter(articleComments, function(obj){ return obj.field == "description"})
      articleObj.voice1_comments = _.filter(articleComments, function(obj){ return obj.field == "voice1"})
      articleObj.voice2_comments = _.filter(articleComments, function(obj){ return obj.field == "voice2"})
      articleObj.voice3_comments = _.filter(articleComments, function(obj){ return obj.field == "voice3"})
      
      
      //ADD LIKERTS
      var articleLikerts = LikertApplications.find({article_id: article_id, removed: false}).fetch() 
      articleObj.voice1_likerts = _.filter(articleLikerts, function(obj){ return obj.field == "voice1"})
      articleObj.voice2_likerts = _.filter(articleLikerts, function(obj){ return obj.field == "voice2"})
      articleObj.voice3_likerts = _.filter(articleLikerts, function(obj){ return obj.field == "voice3"})
      var hasLikert = (articleLikerts.length == 0) ?  "false" : "true"
      articleObj.hasLikert = hasLikert 
      
      if(showAllVoices){
        articleObj.voice1_show = "true" //selectedArticleVoices[article_id]["voice1"] "true"/"false"
        articleObj.voice2_show = "true"
        articleObj.voice3_show = "true"        
      }else{
        articleObj.voice1_show = _.contains(selectedArticleVoices[article_id], "voice1") ? "true" : "false" 
        articleObj.voice2_show = _.contains(selectedArticleVoices[article_id], "voice2") ? "true" : "false"
        articleObj.voice3_show = _.contains(selectedArticleVoices[article_id], "voice3") ? "true" : "false" 
      }
    }
  
    //count visible voices in articlesObj
    var numVisibleVoices = 0
    _.each(articles, function(articleObj){
      if(articleObj.voice1_show == "true"){ numVisibleVoices++ }
      if(articleObj.voice2_show == "true"){ numVisibleVoices++ }
      if(articleObj.voice3_show == "true"){ numVisibleVoices++ }
    })
    
    //Session.set('numResults', articles.length)
    Session.set('numResults', numVisibleVoices)
    return articles

  },




})

boldPhrase = function(txt, phrase){
  var re = new RegExp( "(<>)|("+phrase+")" ,"ig");
  //var re = new RegExp( "("+phrase+")" ,"ig");
  txt = txt.replace (re, function (m0, tag, ch) {
     return tag || ('<b><span class="highlightTerm">' + ch + '</span></b>');
  });
  return txt
}

highlightSearchTermInArticles = function(articles, queryText){
  console.log('highlight: '+queryText)
  for( var i = 0; i < articles.length; i++){
    var articleObj = articles[i]
    
    articleObj.headline = boldPhrase(articleObj.headline, queryText)
    articleObj.description = boldPhrase(articleObj.description, queryText)
    articleObj.voice1 = boldPhrase(articleObj.voice1, queryText)
    articleObj.voice2 = boldPhrase(articleObj.voice2, queryText)
    articleObj.voice3 = boldPhrase(articleObj.voice3, queryText)
  }
  return articles
}

highlightSearchTermInComments = function(comments, queryText){
  for( var i = 0; i < comments.length; i++){
    var commentObj = comments[i]
    
    commentObj.text = boldPhrase(commentObj.text, queryText)
  }
  return comments
}

Template.article.events({
  'click .addComment ': function(event){
      var article_id = this._id
      var field =  $(event.target).data("field") 
      var text = $(event.target).prev("textarea").val()
      console.log(text)
      
      var params = {
        article_id: article_id,
        field: field,
        text: text        
      }
      Meteor.call("addCommentOrTag", params, function(){
        //no callback
      })
      //clear
      $(event.target).prev("textarea").val("")
  },
  'keypress .add-voice-comment ': function(event){
     if (event.charCode == 13) {
      var article_id = this._id
      var field =  $(event.target).data("field") 
      var text = $(event.target).val()
      
      
      var params = {
        article_id: article_id,
        field: field,
        text: text        
      }
      Meteor.call("addCommentOrTag", params, function(){
        //no callback
      })
      //clear
      
      $(event.target).val("")
      
      event.preventDefault()
    }
  },
  'click .show-voices' : function(event){
    //console.log($(event.target).prev(".voices-div"))
    
    $(event.target).prev(".voices-div").show()
    $(event.target).next(".hide-voices").show()
    $(event.target).hide()
  },
  'click .hide-voices' : function(event){
    //console.log($(event.target).prev("div.voices-div").hide()) //why didn't this work?
    
    $(event.target).prev().prev().hide()
    $(event.target).prev(".show-voices").show()
    $(event.target).hide()
  },
  
  //Likert Voting submission
  'click .vote-button' : function(event){
    
    var answer = $(event.currentTarget).data('answer')
    var voice = $(event.currentTarget).data('voice')    
    var article_id = this._id
    var label = "two-stories"
    
    var params = {
      article_id: article_id,
      field: voice, //"voice1"
      label: label, //"two-stories"
      answer: answer //"yes"        
    }
    Meteor.call("addLikert", params, function(){
      //no callback
    })
  },
  
  'click .remove-likert' : function(event){        
    var params = this
    Meteor.call("removeLikert", params, function(){
      //no callback
    })
    
  },
  
  'click .remove-comment' : function(event){
    console.log(this)
    var params = this
    Meteor.call("removeComment", params, function(){
      //no callback
    })
  }
})

