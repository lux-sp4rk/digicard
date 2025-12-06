const consoleEasterEgg = setTheme => {
  let matrixOverlay = null; // Ensure matrixOverlay is in the correct scope

  // Console message for the Digital Dungeon quest
  // ... (rest of the setup logic will be here)

  // Console message for the Digital Dungeon quest
  console.log(
    '%cACCESS GRANTED',
    'color: #2ecc71; font-family: monospace; font-size: 20px; font-weight: bold;'
  );
  console.log(
    '[Log] Mind Online. Welcome to the Luh Sprwhk Portfolio Construct.'
  );
  console.log('[Log] All modules report a state of cheerful readiness.');
  console.log(
    '%cType "hack" to begin your assessment.',
    'color: #3498db; font-family: monospace;'
  );

  // Set up all console commands at once
  Object.defineProperties(window, {
    hack: {
      get: function () {
        // Track easter egg start
        window.umami?.track('easter-egg-hack-typed');

        console.log(
          '%cInitiating Level 1: "Code Breaker"',
          'color: #f39c12; font-family: monospace; font-size: 16px;'
        );
        console.log(
          '%cDecipher the following to continue:',
          'color: #3498db; font-family: monospace;'
        );
        console.log(
          '%c01110010 01100101 01100100 00100000 01101111 01110010 00100000 01100010 01101100 01110101 01100101 00100000 01110000 01101001 01101100 01101100 00101110 00101110 00101110',
          'color: #e74c3c; font-family: monospace;'
        );
        console.log(
          '%cHint: Convert binary to text and choose wisely',
          'color: #7f8c8d; font-family: monospace; font-style: italic;'
        );
        return undefined;
      },
      configurable: true,
    },
    red: {
      get: function () {
        // Track binary puzzle completion
        window.umami?.track('easter-egg-binary-solved');

        console.log(
          '%c🔴 You chose the red pill.',
          'color: #e74c3c; font-family: monospace; font-size: 16px; font-weight: bold;'
        );
        console.log(
          '%c"Welcome to the real world."',
          'color: #f39c12; font-family: monospace; font-style: italic;'
        );
        console.log(
          '%cType "spoon" to continue your journey.',
          'color: #3498db; font-family: monospace;'
        );
        return undefined;
      },
      configurable: true,
    },
    redpill: {
      get: function () {
        return window.red;
      },
      configurable: true,
    },
    'red pill': {
      get: function () {
        return window.red;
      },
      configurable: true,
    },
    'the red pill': {
      get: function () {
        return window.red;
      },
      configurable: true,
    },
    spoon: {
      get: function () {
        // Track spoon challenge start
        window.umami?.track('easter-egg-spoon-challenge');

        console.log(
          '%c[Mind] Reality check protocol activated. A simple test of perception awaits you.',
          'font-size: 16px; font-weight: bold; color: #ff79c6;'
        );
        console.log(
          '%c[Mind] Write a function that returns true when everything is false:',
          'color: #8be9fd;'
        );
        console.log(
          "%c[Mind] Please define a function inside a global var called 'noSpoon' that takes a value and returns:",
          'color: #f8f8f2;'
        );
        console.log(
          "%c- true for any falsy value (false, 0, '', null, undefined, NaN)",
          'color: #50fa7b;'
        );
        console.log('%c- false for any truthy value', 'color: #50fa7b;');
        console.log('%c[Mind] Examples:', 'color: #7f8c8d;');
        console.log(
          '%c  var noSpoon = function(value) { ... }\n  noSpoon = function(value) { ... }\n',
          'color: #7f8c8d; font-family: monospace;'
        );
        console.log(
          '%c[Mind] Remember: There is no spoon.',
          'color: #7f8c8d; font-style: italic;'
        );
        // Hidden verification function
        window.verifyNoSpoon = function (userFunc) {
          try {
            const testCases = [
              { input: false, expected: true },
              { input: 0, expected: true },
              { input: '', expected: true },
              { input: null, expected: true },
              { input: undefined, expected: true },
              { input: NaN, expected: true },
              { input: true, expected: false },
              { input: 1, expected: false },
              { input: 'hello', expected: false },
              { input: [], expected: false },
              { input: {}, expected: false },
            ];

            const results = testCases.map(test => {
              const result = userFunc(test.input);
              return {
                input: test.input,
                expected: test.expected,
                actual: result,
                passed: result === test.expected,
              };
            });

            const allPassed = results.every(r => r.passed);

            if (allPassed) {
              // Track function challenge completion
              window.umami?.track('easter-egg-function-completed');

              console.log(
                '%c🎉 CORRECT! You understand the nature of nothingness.',
                'font-size: 16px; font-weight: bold; color: #50fa7b;'
              );
              console.log(
                '%c[Mind] Now I must ask you a question...',
                'color: #bd93f9;'
              );
              console.log(
                '%c[Mind] Is there a spoon?',
                'color: #f39c12; font-size: 18px; font-weight: bold;'
              );

              // Set up spoon question handlers
              Object.defineProperties(window, {
                'there is no spoon': {
                  get: function () {
                    // Track matrix theme unlock (final stage)
                    window.umami?.track('easter-egg-matrix-unlocked');

                    setTheme('matrix');
                    localStorage.setItem('theme', 'matrix');
                    console.log(
                      '%c🔓 "There is no spoon." - Secret theme unlocked: Welcome to the Matrix!',
                      'color: #00ff41; font-weight: bold; text-shadow: 0 0 5px #0f0;'
                    );
                    return undefined;
                  },
                  configurable: true,
                },
                no: {
                  get: function () {
                    return window['there is no spoon'];
                  },
                  configurable: true,
                },
                'no spoon': {
                  get: function () {
                    return window['there is no spoon'];
                  },
                  configurable: true,
                },
              });
            } else {
              console.log(
                "%c❌ Not quite right. Here's what happened:",
                'color: #ff5555;'
              );
              results.forEach(r => {
                if (!r.passed) {
                  console.log(
                    `For input ${JSON.stringify(r.input)}, expected ${r.expected} but got ${r.actual}`
                  );
                }
              });
              console.log('%cTry again!', 'color: #f1fa8c;');
            }
          } catch (error) {
            console.log(
              '%c Error in your function:',
              'color: #ff5555;',
              error.message
            );
          }
        };

        // Set up the hook to catch when they call their function
        Object.defineProperty(window, 'noSpoon', {
          set: function (func) {
            if (typeof func === 'function') {
              window._noSpoon = func;
              console.log(
                '%cFunction received! Testing with various values...',
                'color: #8be9fd;'
              );
              window.verifyNoSpoon(func);
            }
          },
          get: function () {
            return window._noSpoon;
          },
        });
        return undefined;
      },
      configurable: true,
    },
    matrix: {
      get: function () {
        console.log(
          '%cFINAL LEVEL COMPLETE!',
          'color: #2ecc71; font-family: monospace; font-size: 20px; font-weight: bold;'
        );
        console.log(
          '%cInitiating Matrix mode...',
          'color: #3498db; font-family: monospace;'
        );

        // Add matrix effect to the page
        document.body.classList.add('matrix-mode');

        // Create matrix animation overlay
        matrixOverlay = document.createElement('div');
        matrixOverlay.className = 'matrix-overlay';
        document.body.appendChild(matrixOverlay);

        // Create falling characters
        for (let i = 0; i < 100; i++) {
          const character = document.createElement('div');
          character.className = 'matrix-character';
          character.style.left = `${Math.random() * 100}vw`;
          character.style.animationDuration = `${1 + Math.random() * 3}s`;
          character.style.animationDelay = `${Math.random() * 2}s`;
          character.innerText = String.fromCharCode(
            33 + Math.floor(Math.random() * 94)
          );
          matrixOverlay.appendChild(character);
        }

        // Show success message
        setTimeout(() => {
          alert(
            'Protocol complete. Matrix Mode is now active.\n\n[Mind] My simulated admiration for your resourcefulness is considerable.'
          );
          console.log(
            '%cTo disable Matrix mode, type "clearMatrix"',
            'color: #e74c3c; font-family: monospace;'
          );
          return undefined;
        }, 2000);
        return undefined;
      },
      configurable: true,
    },
    clearMatrix: {
      get: function () {
        document.body.classList.remove('matrix-mode');
        if (matrixOverlay && matrixOverlay.parentNode) {
          matrixOverlay.parentNode.removeChild(matrixOverlay);
        }
        console.log(
          '%cMatrix mode deactivated',
          'color: #3498db; font-family: monospace;'
        );
        console.log(
          '%cType "matrix" to reactivate',
          'color: #7f8c8d; font-family: monospace;'
        );
        return undefined;
      },
      configurable: true,
    },
    christmas: {
      get: function () {
        // Track Christmas theme activation
        window.umami?.track('easter-egg-christmas-activated');

        setTheme('christmas');
        localStorage.setItem('theme', 'christmas');
        console.log(
          '%c🎄 Ho Ho Ho! Christmas theme activated! 🎅',
          'color: #c41e3a; font-weight: bold; font-size: 18px; text-shadow: 0 0 5px #ffd700;'
        );
        console.log(
          '%c❄️ Wishing you a festive season filled with joy and code! ✨',
          'color: #0f5132; font-style: italic; font-size: 14px;'
        );
        console.log(
          '%cTip: Try typing "santaslist" to check if you\'ve been naughty or nice this year!',
          'color: #ffd700; font-family: monospace; font-size: 12px;'
        );
        return undefined;
      },
      configurable: true,
    },
    santaslist: {
      get: function () {
        // Track Santa's list check
        window.umami?.track('easter-egg-santas-list');

        console.log(
          "%c🎅 Checking Santa's List... 📜",
          'color: #c41e3a; font-weight: bold; font-size: 16px;'
        );
        console.log(
          '%c⏳ Loading...',
          'color: #ffd700; font-family: monospace;'
        );

        setTimeout(() => {
          console.log(
            "%c✅ Good news! You're on the NICE list! 🎁",
            'color: #0f5132; font-weight: bold; font-size: 18px;'
          );
          console.log(
            '%c🌟 Your dedication to clean code and best practices has been noted!',
            'color: #ffd700; font-style: italic;'
          );
          console.log(
            '%c🎄 Keep up the great work, and happy holidays!',
            'color: #c41e3a;'
          );
          console.log(
            '%cType "snowflake" to see something magical... ❄️',
            'color: #e6f7ff; font-family: monospace; font-size: 12px;'
          );
        }, 1500);
        return undefined;
      },
      configurable: true,
    },
    snowflake: {
      get: function () {
        // Track snowflake command
        window.umami?.track('easter-egg-snowflake');

        console.log(
          '%c❄️ Every snowflake is unique, just like every line of code you write! ✨',
          'color: #e6f7ff; font-size: 16px; font-weight: bold;'
        );
        console.log(
          '%c    *     .    *   ',
          'color: #c0c0c0; font-family: monospace;'
        );
        console.log(
          '%c  .   *   .  *  . ',
          'color: #e6f7ff; font-family: monospace;'
        );
        console.log(
          '%c *  .  *   .   *  ',
          'color: #c0c0c0; font-family: monospace;'
        );
        console.log(
          '%c  .   *  .   *  . ',
          'color: #e6f7ff; font-family: monospace;'
        );
        console.log(
          '%c    *    .  *     ',
          'color: #c0c0c0; font-family: monospace;'
        );
        console.log(
          '%c🎁 May your holidays be merry and your code be bug-free!',
          'color: #ffd700; font-style: italic; font-size: 14px;'
        );
        return undefined;
      },
      configurable: true,
    },
  });

  // Return a cleanup function
  return () => {
    delete window.hack;
    delete window.red;
    delete window.redpill;
    delete window['red pill'];
    delete window['the red pill'];
    delete window.spoon;
    delete window.matrix;
    delete window.clearMatrix;
    delete window.christmas;
    delete window.santaslist;
    delete window.snowflake;
    delete window.verifyNoSpoon;
    delete window.noSpoon;
    delete window._noSpoon;
    delete window['there is no spoon'];
    delete window['no'];
    delete window['no spoon'];

    // Remove matrix overlay if it exists
    if (matrixOverlay && matrixOverlay.parentNode) {
      matrixOverlay.parentNode.removeChild(matrixOverlay);
    }

    // Attempt to remove quest-key if it exists (from original cleanup logic)
    const questKey = document.querySelector('.quest-key');
    if (questKey && questKey.parentNode) {
      questKey.parentNode.removeChild(questKey);
    }
  };
};
export default consoleEasterEgg;
