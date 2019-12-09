ElectionApp = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return ElectionApp.initWeb3();
  },

  initWeb3: function() {

    if (typeof web3 !== 'undefined') {
      ElectionApp.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      ElectionApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(ElectionApp.web3Provider);
    }
    return ElectionApp.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election1) {
      ElectionApp.contracts.Election = TruffleContract(election1);
      ElectionApp.contracts.Election.setProvider(App.web3Provider);

      ElectionApp.listenForEvents();

      return ElectionApp.render();
    });
  },

  listenForEvents: function() {
    ElectionApp.contracts.Election.deployed().then(function(i) {
      i.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        ElectionApp.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var l = $("#loader");
    var c = $("#content");

    l.show();
    c.hide();

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        ElectionApp.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    ElectionApp.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      if(hasVoted) {
        $('form').hide();
      }
      l.hide();
      c.show();
    }).catch(function(error) {
      console.warn("!!!");
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    ElectionApp.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: ElectionApp.account });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    ElectionApp.init();
  });
});
