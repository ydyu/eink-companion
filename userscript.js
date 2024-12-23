// NEW IMPLEMENTATION
(function() {
    var EinkCompanion = (function() {
        var self = this;
        self.OPTIONS = {
            enabled: true,
            floatingButtons: true,
            whiteBackground: false,
            blackText: false,
            boldText: true,
            bottomMargin: '50%',
            edgeMargin: '28px',
            buttonSize: '11%',
            scrollAmount: '80%',
        };

        self.scrollElement = window;

        //#region Style Injection
        self.injectStyles = function(options) {
            // generate styles array based on what is set to true
            var styles = ["whiteBackground", "blackText", "boldText"].filter(function(style) {
                return options[style];
            }).map(function(style) {
                return style + ".css";
            });

            chrome.runtime.sendMessage({action: "injectCSS", cssFiles: styles});
        };

        self.removeStyles = function() {
            // remove all styles
            var styles = ["whiteBackground", "blackText", "boldText"].map(function(style) {
                return style + ".css";
            });

            chrome.runtime.sendMessage({action: "removeCSS", cssFiles: styles});
        };
        //#endregion

        //#region Floating Buttons
        self.addFloatingButtons = function(options) {
            var createButton = function(id, text, bottom, right, size, clickHandler) {
                var button = document.createElement('div');
                button.id = id;

                // restore default font weight and background color
                button.style.setProperty("font-weight", "normal", "important");
                button.style.setProperty("background-color", "rgba(0,0,0,0)", "important");
                button.style.setProperty("color", "#000", "important");

                button.style.position = 'fixed';
                button.style.bottom = bottom;
                button.style.zIndex = '99999';
                button.style.right = right;
                button.style.width = size + 'px';
                button.style.height = size + 'px';
                button.style.border = '1px dashed #000';
                button.style.boxShadow = 'inset 0 0 0 1px #fff';
                button.style.borderRadius = '50%';
                button.style.textAlign = 'center';
                button.style.cursor = 'pointer';
                button.style.textShadow = '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff';
                button.style.lineHeight = Math.floor(size / 2) + 'px';
                button.style.fontSize = Math.floor(size / 2) + 'px';
                button.style.display = 'flex';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.innerHTML = text;
                button.onclick = clickHandler;
                document.body.appendChild(button);
            };

            var calculatePercentPx = function(value, fullVal) {
                var val = 0, value = value + '';
                try {
                    val = value.endsWith('%') ?
                        Math.floor(
                            (fullVal || 100) * (parseInt(value) / 100)) :
                        parseInt(value);
                } catch (e) {}
                return val;
            };

            var updateScrollElement = function() {
                // check if scrollElement is still valid
                var needUpdate = false;
                if (!self.scrollElement) needUpdate = true;
                else if(self.scrollElement === window) {
                    // only update if window is not scrollable
                    needUpdate = document.documentElement.scrollHeight <= document.documentElement.clientHeight;
                } else {
                    // only update if element is completely out of view
                    var rect = self.scrollElement.getBoundingClientRect();
                    needUpdate = (
                        rect.width === 0 ||
                        rect.height === 0
                    );
                }

                if (needUpdate) {
                    // pick the visible overflowing element with biggest scroll height
                    var elements = document.querySelectorAll('*');
                    var maxScrollHeight = 0;
                    elements.forEach(function(element) {
                        var rect = element.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return;
                        if (element.scrollHeight > element.clientHeight && element.scrollHeight > maxScrollHeight) {
                            self.scrollElement = element;
                            maxScrollHeight = element.scrollHeight;
                        }
                    });
                }
            };

            var calculateScrollAmount = function() {
                var elementHeight = self.scrollElement === window ?
                    window.innerHeight :
                    self.scrollElement.clientHeight;
                return options.scrollAmount.indexOf('%') > -1 ?
                    elementHeight * (parseInt(options.scrollAmount) / 100) :
                    parseInt(options.scrollAmount);
            };

            options = options || self.OPTIONS;

            // process config
            var bottomMargin = calculatePercentPx(options.bottomMargin, window.innerHeight),
                edgeMargin = calculatePercentPx(options.edgeMargin, window.innerWidth),
                buttonSize = calculatePercentPx(options.buttonSize, Math.min(window.innerWidth, window.innerHeight));

            // upon any element scroll, check if the element is overflowing, if so, set the scrollElement
            document.addEventListener('scroll', function(e) {
                var element = e.target;
                if (element === document) element = window;
                self.scrollElement = element;
            }, true);

            // create scroll down button
            createButton('__floatingButtons_scrollDown', '▿', bottomMargin + 'px', edgeMargin + 'px', buttonSize, function() {
                updateScrollElement();
                self.scrollElement.scrollBy({
                    top: calculateScrollAmount(),
                    behavior: 'instant'
                });
            });

            // create scroll up button
            createButton('__floatingButtons_scrollUp', '▵', (bottomMargin + buttonSize) + 'px', edgeMargin + 'px', buttonSize, function() {
                updateScrollElement();
                self.scrollElement.scrollBy({
                    top: -calculateScrollAmount(),
                    behavior: 'instant'
                });
            });

            // create a top button to shift the button strip between left and right edge
            createButton('__floatingButtons_shift', '⇄', (bottomMargin + buttonSize * 2) + 'px', edgeMargin + 'px', buttonSize, function() {
                var right = document.getElementById('__floatingButtons_scrollUp').style.right;
                if (right) {
                    document.getElementById('__floatingButtons_scrollUp').style.left = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_scrollDown').style.left = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_shift').style.left = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_scrollUp').style.right = '';
                    document.getElementById('__floatingButtons_scrollDown').style.right = '';
                    document.getElementById('__floatingButtons_shift').style.right = '';
                }
                else {
                    document.getElementById('__floatingButtons_scrollUp').style.right = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_scrollDown').style.right = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_shift').style.right = edgeMargin + 'px';
                    document.getElementById('__floatingButtons_scrollUp').style.left = '';
                    document.getElementById('__floatingButtons_scrollDown').style.left = '';
                    document.getElementById('__floatingButtons_shift').style.left = '';
                }
            });
        };

        self.removeFloatingButtons = function() {
            var buttons = document.querySelectorAll('[id^="__floatingButtons_"]');
            buttons.forEach(function(button) {
                button.remove();
            });
        };
        //#endregion

        self.processMessage = function(message) {
            if (message.options) self.OPTIONS = message.options;

            switch(message.action) {
                case "globalToggle":
                    self.removeStyles();
                    self.removeFloatingButtons();

                    if (message.options.enabled) {
                        self.injectStyles(message.options);
                        if (message.options.floatingButtons) {
                            self.addFloatingButtons(message.options);
                        }
                    }
                    break;
                case "updateStyle":
                    self.removeStyles();
                    self.injectStyles(message.options);
                    break;
                case "updateFloatingButtons":
                    self.removeFloatingButtons();
                    if (message.options.floatingButtons) {
                        self.addFloatingButtons(message.options);
                    }
                    break;
            }
        };

        self.init = function(options) {
            // get options from storage
            chrome.storage.sync.get("options", function(data) {
                if(options) {
                    Object.assign(self.OPTIONS, options);
                } else if (data.options) {
                    Object.assign(self.OPTIONS, data.options);
                }
                if (self.OPTIONS.enabled) {
                    self.injectStyles(self.OPTIONS);
                    if (self.OPTIONS.floatingButtons) {
                        self.addFloatingButtons(self.OPTIONS);
                    }
                }
            });

            // listen for messages from options page
            chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
                self.processMessage(message);
            });
        };

        return self;
    })();

    setTimeout(function() {
        EinkCompanion.init();
    }, 100);
})();
