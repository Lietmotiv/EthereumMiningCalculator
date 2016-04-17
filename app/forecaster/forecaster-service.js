angular.module('ethMiningCalc')
  .factory('ForecasterService', ['$rootScope', '$timeout', 'MarketDataService', 'ForecasterCalcAdapterService', function($rootScope, $timeout, marketDataService, forecasterCalcAdapterService) {
    var factory = {};
    var userInputs = {};

    var lists = {
      "cryptocurrency": {
        eth: {
          title: "Ethereum (ETH)",
          code: 'eth',
          crypto_Block: 5
        },
        btc: {
          title: "Bitcoin (BTC)",
          code: 'btc',
          crypto_Block: 25 //May need to pull this data. It changes in July 2016
        },
        other: {
          title: "Other",
          code: 'other',
          crypto_Block: 0
        }
      },
      "difficultyType": {
        fixed: {
          title: "None",
          code: 'none',
          form: ""
        },
        automatic: {
          title: "Automatic (Find Best Fit)",
          code: 'auto',
          form: ""
        },
        linear: {
          title: "Linear",
          code: 'linear',
          form: "D = a*B + b"
        },
        quadratic: {
          title: "Quadratic",
          code: 'quadratic',
          form: "D= a*B^2 + b*B + c"
        },
        exponential: {
          title: "Exponential",
          code: 'exponential',
          form: "D = Aexp(bx)"
        }
      },
      "costPrediction": {
        enable: {
          title: "Enable Cost Predicition",
          code: 'enable'
        },
        disable: {
          title: "Disable Cost Prediction",
          code: 'disable'
        }
      },
      "fiatCurrencies": {
        aud: {
          title: "Australian Dollar (AUD)",
          code: "aud"
        },
        usd: {
          title: "US Dollar (USD)",
          code: "usd"
        },
        other: {
          title: "Other",
          code: "other"
        }
      }
    };

    var broadcastFiatCurrencyRates = function() {
      var broadcastChannel = 'fiatCurrency';
      $rootScope.$broadcast(broadcastChannel, { "loading": true });
      marketDataService.getRates(userInputs.cryptocurrency)
        .then(function(list) {
          $rootScope.$broadcast(broadcastChannel, { value: 0, list: list });
        })
        .catch(function(error) {
          $rootScope.$broadcast(broadcastChannel, { value: 0, list: [] });
        });
    }



    /**
     * Get this item and broadcast it to components
     */
    var broadcastDifficultyValue = function() {
      var broadcastChannel = 'difficultyValue'
      $rootScope.$broadcast(broadcastChannel, { "loading": true });
      marketDataService.getDifficulty(userInputs.cryptocurrency)
        .then(function(result) {
          $rootScope.$apply(function() {
            $rootScope.$broadcast(broadcastChannel, { "value": result });
          });
        })
        .catch(function() {
          $rootScope.$apply(function() {
            $rootScope.$broadcast(broadcastChannel, { empty: true });
          });
        });
    }

    /**
     * Get this item and broadcast it to components
     */
    var broadcastBlockTime = function() {
      var broadcastChannel = 'blockTime'
      $rootScope.$broadcast(broadcastChannel, { "loading": true });
      marketDataService.blockTime(userInputs.cryptocurrency)
        .then(function(result) {
          $rootScope.$apply(function() {
            $rootScope.$broadcast(broadcastChannel, { "value": result });
          });
        })
        .catch(function() {
          $rootScope.$apply(function() {
            $rootScope.$broadcast(broadcastChannel, { empty: true });
          });

        });
    }

    /**
     * Register an input to the forecaster from a user. Typically called from a directive.
     * 
     * @param type String labelling the input
     * @param value Object representing the value added by the user
     */
    factory.registerUserInput = function(type, value) {
      userInputs[type] = value;

      if (type === 'difficultyType' && userInputs['difficultyType'] === 'none') { broadcastDifficultyValue(); };
      if (type === 'difficultyValue') { broadcastBlockTime(); }
      if (type === 'costPrediction' && value === "enable") { broadcastFiatCurrencyRates(); }

      $rootScope.$broadcast('userInputs-updated');
    }

    /**
     * Getter function for the userInputs obj
     * 
     * @returns Object userInputs
     */
    factory.getUserInputs = function() {
      return userInputs;
    }

    factory.getList = function(list) {
      if (lists[list] === undefined) return {};
      return lists[list];
    };

    /**
     * Generate plots & results
     */
    factory.calculate = function() {
      forecasterCalcAdapterService.calculate(userInputs);
    };

    return factory;
  }]);