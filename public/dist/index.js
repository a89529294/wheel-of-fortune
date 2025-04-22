"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/.pnpm/toastify-js@1.12.0/node_modules/toastify-js/src/toastify.js
  var require_toastify = __commonJS({
    "node_modules/.pnpm/toastify-js@1.12.0/node_modules/toastify-js/src/toastify.js"(exports, module) {
      (function(root, factory) {
        if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          root.Toastify = factory();
        }
      })(exports, function(global) {
        var Toastify2 = function(options) {
          return new Toastify2.lib.init(options);
        }, version = "1.12.0";
        Toastify2.defaults = {
          oldestFirst: true,
          text: "Toastify is awesome!",
          node: void 0,
          duration: 3e3,
          selector: void 0,
          callback: function() {
          },
          destination: void 0,
          newWindow: false,
          close: false,
          gravity: "toastify-top",
          positionLeft: false,
          position: "",
          backgroundColor: "",
          avatar: "",
          className: "",
          stopOnFocus: true,
          onClick: function() {
          },
          offset: { x: 0, y: 0 },
          escapeMarkup: true,
          ariaLive: "polite",
          style: { background: "" }
        };
        Toastify2.lib = Toastify2.prototype = {
          toastify: version,
          constructor: Toastify2,
          // Initializing the object with required parameters
          init: function(options) {
            if (!options) {
              options = {};
            }
            this.options = {};
            this.toastElement = null;
            this.options.text = options.text || Toastify2.defaults.text;
            this.options.node = options.node || Toastify2.defaults.node;
            this.options.duration = options.duration === 0 ? 0 : options.duration || Toastify2.defaults.duration;
            this.options.selector = options.selector || Toastify2.defaults.selector;
            this.options.callback = options.callback || Toastify2.defaults.callback;
            this.options.destination = options.destination || Toastify2.defaults.destination;
            this.options.newWindow = options.newWindow || Toastify2.defaults.newWindow;
            this.options.close = options.close || Toastify2.defaults.close;
            this.options.gravity = options.gravity === "bottom" ? "toastify-bottom" : Toastify2.defaults.gravity;
            this.options.positionLeft = options.positionLeft || Toastify2.defaults.positionLeft;
            this.options.position = options.position || Toastify2.defaults.position;
            this.options.backgroundColor = options.backgroundColor || Toastify2.defaults.backgroundColor;
            this.options.avatar = options.avatar || Toastify2.defaults.avatar;
            this.options.className = options.className || Toastify2.defaults.className;
            this.options.stopOnFocus = options.stopOnFocus === void 0 ? Toastify2.defaults.stopOnFocus : options.stopOnFocus;
            this.options.onClick = options.onClick || Toastify2.defaults.onClick;
            this.options.offset = options.offset || Toastify2.defaults.offset;
            this.options.escapeMarkup = options.escapeMarkup !== void 0 ? options.escapeMarkup : Toastify2.defaults.escapeMarkup;
            this.options.ariaLive = options.ariaLive || Toastify2.defaults.ariaLive;
            this.options.style = options.style || Toastify2.defaults.style;
            if (options.backgroundColor) {
              this.options.style.background = options.backgroundColor;
            }
            return this;
          },
          // Building the DOM element
          buildToast: function() {
            if (!this.options) {
              throw "Toastify is not initialized";
            }
            var divElement = document.createElement("div");
            divElement.className = "toastify on " + this.options.className;
            if (!!this.options.position) {
              divElement.className += " toastify-" + this.options.position;
            } else {
              if (this.options.positionLeft === true) {
                divElement.className += " toastify-left";
                console.warn("Property `positionLeft` will be depreciated in further versions. Please use `position` instead.");
              } else {
                divElement.className += " toastify-right";
              }
            }
            divElement.className += " " + this.options.gravity;
            if (this.options.backgroundColor) {
              console.warn('DEPRECATION NOTICE: "backgroundColor" is being deprecated. Please use the "style.background" property.');
            }
            for (var property in this.options.style) {
              divElement.style[property] = this.options.style[property];
            }
            if (this.options.ariaLive) {
              divElement.setAttribute("aria-live", this.options.ariaLive);
            }
            if (this.options.node && this.options.node.nodeType === Node.ELEMENT_NODE) {
              divElement.appendChild(this.options.node);
            } else {
              if (this.options.escapeMarkup) {
                divElement.innerText = this.options.text;
              } else {
                divElement.innerHTML = this.options.text;
              }
              if (this.options.avatar !== "") {
                var avatarElement = document.createElement("img");
                avatarElement.src = this.options.avatar;
                avatarElement.className = "toastify-avatar";
                if (this.options.position == "left" || this.options.positionLeft === true) {
                  divElement.appendChild(avatarElement);
                } else {
                  divElement.insertAdjacentElement("afterbegin", avatarElement);
                }
              }
            }
            if (this.options.close === true) {
              var closeElement = document.createElement("button");
              closeElement.type = "button";
              closeElement.setAttribute("aria-label", "Close");
              closeElement.className = "toast-close";
              closeElement.innerHTML = "&#10006;";
              closeElement.addEventListener(
                "click",
                function(event) {
                  event.stopPropagation();
                  this.removeElement(this.toastElement);
                  window.clearTimeout(this.toastElement.timeOutValue);
                }.bind(this)
              );
              var width = window.innerWidth > 0 ? window.innerWidth : screen.width;
              if ((this.options.position == "left" || this.options.positionLeft === true) && width > 360) {
                divElement.insertAdjacentElement("afterbegin", closeElement);
              } else {
                divElement.appendChild(closeElement);
              }
            }
            if (this.options.stopOnFocus && this.options.duration > 0) {
              var self = this;
              divElement.addEventListener(
                "mouseover",
                function(event) {
                  window.clearTimeout(divElement.timeOutValue);
                }
              );
              divElement.addEventListener(
                "mouseleave",
                function() {
                  divElement.timeOutValue = window.setTimeout(
                    function() {
                      self.removeElement(divElement);
                    },
                    self.options.duration
                  );
                }
              );
            }
            if (typeof this.options.destination !== "undefined") {
              divElement.addEventListener(
                "click",
                function(event) {
                  event.stopPropagation();
                  if (this.options.newWindow === true) {
                    window.open(this.options.destination, "_blank");
                  } else {
                    window.location = this.options.destination;
                  }
                }.bind(this)
              );
            }
            if (typeof this.options.onClick === "function" && typeof this.options.destination === "undefined") {
              divElement.addEventListener(
                "click",
                function(event) {
                  event.stopPropagation();
                  this.options.onClick();
                }.bind(this)
              );
            }
            if (typeof this.options.offset === "object") {
              var x = getAxisOffsetAValue("x", this.options);
              var y = getAxisOffsetAValue("y", this.options);
              var xOffset = this.options.position == "left" ? x : "-" + x;
              var yOffset = this.options.gravity == "toastify-top" ? y : "-" + y;
              divElement.style.transform = "translate(" + xOffset + "," + yOffset + ")";
            }
            return divElement;
          },
          // Displaying the toast
          showToast: function() {
            this.toastElement = this.buildToast();
            var rootElement;
            if (typeof this.options.selector === "string") {
              rootElement = document.getElementById(this.options.selector);
            } else if (this.options.selector instanceof HTMLElement || typeof ShadowRoot !== "undefined" && this.options.selector instanceof ShadowRoot) {
              rootElement = this.options.selector;
            } else {
              rootElement = document.body;
            }
            if (!rootElement) {
              throw "Root element is not defined";
            }
            var elementToInsert = Toastify2.defaults.oldestFirst ? rootElement.firstChild : rootElement.lastChild;
            rootElement.insertBefore(this.toastElement, elementToInsert);
            Toastify2.reposition();
            if (this.options.duration > 0) {
              this.toastElement.timeOutValue = window.setTimeout(
                function() {
                  this.removeElement(this.toastElement);
                }.bind(this),
                this.options.duration
              );
            }
            return this;
          },
          hideToast: function() {
            if (this.toastElement.timeOutValue) {
              clearTimeout(this.toastElement.timeOutValue);
            }
            this.removeElement(this.toastElement);
          },
          // Removing the element from the DOM
          removeElement: function(toastElement) {
            toastElement.className = toastElement.className.replace(" on", "");
            window.setTimeout(
              function() {
                if (this.options.node && this.options.node.parentNode) {
                  this.options.node.parentNode.removeChild(this.options.node);
                }
                if (toastElement.parentNode) {
                  toastElement.parentNode.removeChild(toastElement);
                }
                this.options.callback.call(toastElement);
                Toastify2.reposition();
              }.bind(this),
              400
            );
          }
        };
        Toastify2.reposition = function() {
          var topLeftOffsetSize = {
            top: 15,
            bottom: 15
          };
          var topRightOffsetSize = {
            top: 15,
            bottom: 15
          };
          var offsetSize = {
            top: 15,
            bottom: 15
          };
          var allToasts = document.getElementsByClassName("toastify");
          var classUsed;
          for (var i = 0; i < allToasts.length; i++) {
            if (containsClass(allToasts[i], "toastify-top") === true) {
              classUsed = "toastify-top";
            } else {
              classUsed = "toastify-bottom";
            }
            var height = allToasts[i].offsetHeight;
            classUsed = classUsed.substr(9, classUsed.length - 1);
            var offset = 15;
            var width = window.innerWidth > 0 ? window.innerWidth : screen.width;
            if (width <= 360) {
              allToasts[i].style[classUsed] = offsetSize[classUsed] + "px";
              offsetSize[classUsed] += height + offset;
            } else {
              if (containsClass(allToasts[i], "toastify-left") === true) {
                allToasts[i].style[classUsed] = topLeftOffsetSize[classUsed] + "px";
                topLeftOffsetSize[classUsed] += height + offset;
              } else {
                allToasts[i].style[classUsed] = topRightOffsetSize[classUsed] + "px";
                topRightOffsetSize[classUsed] += height + offset;
              }
            }
          }
          return this;
        };
        function getAxisOffsetAValue(axis, options) {
          if (options.offset[axis]) {
            if (isNaN(options.offset[axis])) {
              return options.offset[axis];
            } else {
              return options.offset[axis] + "px";
            }
          }
          return "0px";
        }
        function containsClass(elem, yourClass) {
          if (!elem || typeof yourClass !== "string") {
            return false;
          } else if (elem.className && elem.className.trim().split(/\s+/gi).indexOf(yourClass) > -1) {
            return true;
          } else {
            return false;
          }
        }
        Toastify2.lib.init.prototype = Toastify2.lib;
        return Toastify2;
      });
    }
  });

  // src/constants.ts
  var ADMIN_PASSWORD = "iamadmin";
  var HARDCODED_PRIZES = [
    {
      id: "a",
      name: "Prize A",
      probability: 10,
      hitCount: 1,
      initialProbability: 10,
      initialHitCount: 1
    },
    {
      id: "b",
      name: "Prize B",
      probability: 30,
      hitCount: 2,
      initialProbability: 30,
      initialHitCount: 2
    },
    {
      id: "c",
      name: "Prize C",
      probability: 60,
      hitCount: 5,
      initialProbability: 60,
      initialHitCount: 5
    }
  ];
  var HARDCODED_PARTICIPANTS = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
    { id: "p3", name: "Charlie" },
    { id: "p4", name: "Diana" },
    { id: "p5", name: "Eve" },
    { id: "p6", name: "Frank" },
    { id: "p7", name: "Grace" },
    { id: "p8", name: "Heidi" },
    { id: "p9", name: "Ivan" },
    { id: "p10", name: "Judy" }
  ];
  var PAUSE_TIME = 3e3;

  // src/storage.ts
  var STORAGE_KEY = "wof_app_state_v1";
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // src/game-logic.ts
  function pickPrizeId(state) {
    const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
    const weights = prizes.map((p) => p.probability);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < prizes.length; ++i) {
      if (r < weights[i]) return prizes[i].id;
      r -= weights[i];
    }
    return prizes[0].id;
  }
  function finalizePendingSpin(state) {
    if (!state.pendingSpin) return;
    const { participantId, prizeId } = state.pendingSpin;
    const participant = state.participants.find((p) => p.id === participantId);
    const prize = state.prizes.find((p) => p.id === prizeId);
    if (!participant || !prize) {
      state.pendingSpin = void 0;
      return;
    }
    state.bowl = state.bowl.filter((id) => id !== participantId);
    state.prizesState[prize.id]--;
    state.log.push({
      spin: state.spinNumber,
      participant: participant.name,
      prize: prize.name
    });
    state.spinNumber++;
    state.drawnParticipantId = void 0;
    state.pendingSpin = void 0;
  }
  function getRotationForPrize(state, prize) {
    const prizes = state.prizes.filter(
      (p) => state.prizesState[p.id] > 0 || p.id === prize.id
    );
    const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
    let angles = [];
    let angle = -Math.PI / 2;
    for (const p of prizes) {
      const slice = p.probability / totalProb * 2 * Math.PI;
      angles.push({ id: p.id, start: angle, end: angle + slice });
      angle += slice;
    }
    const target = angles.find((a) => a.id === prize.id);
    const targetAngle = (target.start + target.end) / 2;
    return Math.PI * 3 / 2 - targetAngle;
  }

  // src/ui.ts
  function renderWheel(state) {
    const canvas = document.getElementById("wheel-canvas");
    const overlay = document.getElementById("wheel-overlay");
    if (!hasPrizes(state)) {
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
    const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    let startAngle = -Math.PI / 2;
    prizes.forEach((prize, i) => {
      const sliceAngle = prize.probability / totalProb * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][i % 5];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#222";
      ctx.fillText(prize.name, radius - 16, 8);
      ctx.restore();
      startAngle += sliceAngle;
    });
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 0);
    ctx.lineTo(centerX - 18, centerY - radius + 28);
    ctx.lineTo(centerX + 18, centerY - radius + 28);
    ctx.closePath();
    ctx.fillStyle = "#6366f1";
    ctx.fill();
  }
  function drawWheelWithRotation(state, rot) {
    const canvas = document.getElementById("wheel-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
    const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    let startAngle = -Math.PI / 2 + rot;
    prizes.forEach((prize, i) => {
      const sliceAngle = prize.probability / totalProb * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][i % 5];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#222";
      ctx.fillText(prize.name, radius - 16, 8);
      ctx.restore();
      startAngle += sliceAngle;
    });
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 0);
    ctx.lineTo(centerX - 18, centerY - radius + 28);
    ctx.lineTo(centerX + 18, centerY - radius + 28);
    ctx.closePath();
    ctx.fillStyle = "#6366f1";
    ctx.fill();
  }
  function hasPrizes(state) {
    return Object.values(state.prizesState).some((count) => count > 0);
  }
  function renderBowl(state, onDraw) {
    const label = document.getElementById("bowl-count-label");
    label.textContent = `\u5269\u9918\u53C3\u8207\u8005:${state.bowl.length}`;
    const bowlDiv = document.getElementById("bowl");
    if (state.drawnParticipantId || !hasPrizes(state)) {
      bowlDiv.style.pointerEvents = "none";
      bowlDiv.style.opacity = "0.6";
    } else {
      bowlDiv.style.pointerEvents = "auto";
      bowlDiv.style.opacity = "1";
      bowlDiv.onclick = () => {
        if (state.bowl.length === 0 || !hasPrizes(state)) return;
        const idx = Math.floor(Math.random() * state.bowl.length);
        onDraw(state.bowl[idx]);
      };
    }
  }
  function renderLog(state) {
    const logBody = document.getElementById("log-body");
    logBody.innerHTML = "";
    state.log.forEach((entry) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${entry.spin}</td><td>${entry.participant}</td><td>${entry.prize}</td>`;
      logBody.appendChild(tr);
    });
  }
  function renderCurrentParticipant(state) {
    const cpDiv = document.getElementById("current-participant");
    const spinBtn = document.getElementById("spin-btn");
    if (state.drawnParticipantId) {
      const p = state.participants.find((x) => x.id === state.drawnParticipantId);
      cpDiv.textContent = p ? `\u53C3\u8207\u8005: ${p.name}` : "";
      spinBtn.disabled = !!state.pendingSpin || !hasPrizes(state);
    } else {
      cpDiv.textContent = "";
      spinBtn.disabled = true;
    }
  }

  // src/main.ts
  var import_toastify_js = __toESM(require_toastify());
  function createInitialState() {
    const prizesState = {};
    HARDCODED_PRIZES.forEach((prize) => {
      prizesState[prize.id] = prize.initialHitCount;
    });
    return {
      prizes: HARDCODED_PRIZES.map((p) => ({ ...p })),
      participants: HARDCODED_PARTICIPANTS.map((p) => ({ ...p })),
      bowl: HARDCODED_PARTICIPANTS.map((p) => p.id),
      prizesState,
      log: [],
      spinNumber: 1,
      drawnParticipantId: void 0,
      pendingSpin: void 0
    };
  }
  function handleAdminButton() {
    const pw = prompt("Enter admin password:");
    if (pw === ADMIN_PASSWORD) {
      window.location.href = "setup.html";
    } else if (pw !== null) {
      alert("Incorrect password.");
    }
  }
  function handleResetSpins() {
    if (confirm(
      "\u91CD\u7F6E\u62BD\u734E\u7D00\u9304\uFF1F\u9019\u5C07\u6703\u6062\u5FA9\u6240\u6709\u53C3\u8207\u8005\u81F3\u62BD\u734E\u6C60\uFF0C\u91CD\u8A2D\u6240\u6709\u734E\u9805\u6B21\u6578\u53CA\u62BD\u734E\u7D00\u9304\u3002\u734E\u9805\u8207\u53C3\u8207\u8005\u540D\u55AE\u5C07\u6703\u4FDD\u7559\u3002"
    )) {
      const state = loadState();
      if (!state) return;
      state.bowl = state.participants.map((p) => p.id);
      state.prizesState = {};
      state.prizes.forEach((prize) => {
        state.prizesState[prize.id] = prize.initialHitCount;
      });
      state.log = [];
      state.spinNumber = 1;
      state.drawnParticipantId = void 0;
      state.pendingSpin = void 0;
      saveState(state);
      renderGamePage();
    }
  }
  function renderGamePage() {
    let state = loadState();
    if (!state) {
      state = createInitialState();
      saveState(state);
    }
    renderCurrentParticipant(state);
    if (state.pendingSpin) {
      const prize = state.prizes.find((p) => p.id === state.pendingSpin.prizeId);
      if (prize) {
        drawWheelWithRotation(state, getRotationForPrize(state, prize));
      } else {
        renderWheel(state);
      }
    } else {
      renderWheel(state);
    }
    renderBowl(state, (pid) => handleDrawParticipant(state, pid));
    renderLog(state);
    const spinBtn = document.getElementById("spin-btn");
    const gameResetBtn = document.getElementById(
      "reset-spins-btn"
    );
    spinBtn.disabled = !state.drawnParticipantId || !!state.pendingSpin;
    spinBtn.onclick = () => handleSpin(state);
    gameResetBtn.disabled = loadState()?.log.length === 0 || !!state.pendingSpin;
  }
  function handleDrawParticipant(state, pid) {
    if (state.pendingSpin) {
      finalizePendingSpin(state);
    }
    state.drawnParticipantId = pid;
    saveState(state);
    renderGamePage();
  }
  var animating = false;
  function animateWheelToPrize(prize, cb) {
    if (animating) return;
    animating = true;
    const canvas = document.getElementById("wheel-canvas");
    const ctx = canvas.getContext("2d");
    const state = loadState();
    if (!state) {
      cb();
      animating = false;
      return;
    }
    const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
    const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
    let angles = [];
    let angle = -Math.PI / 2;
    for (const p of prizes) {
      const slice = p.probability / totalProb * 2 * Math.PI;
      angles.push({ id: p.id, start: angle, end: angle + slice });
      angle += slice;
    }
    const target = angles.find((a) => a.id === prize.id);
    const targetAngle = (target.start + target.end) / 2;
    const fullTurns = 4;
    const finalAngle = 2 * Math.PI * fullTurns + (Math.PI * 3 / 2 - targetAngle);
    const duration = 2250;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const angle2 = ease * finalAngle;
      if (!state) {
        animating = false;
        cb();
        return;
      }
      drawWheelWithRotation(state, angle2);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        animating = false;
        cb();
      }
    }
    requestAnimationFrame(animate);
  }
  function handleSpin(state) {
    const spinBtn = document.getElementById("spin-btn");
    const resetSpinsBtn = document.getElementById(
      "reset-spins-btn"
    );
    spinBtn.disabled = true;
    resetSpinsBtn.disabled = true;
    if (!state.drawnParticipantId || state.pendingSpin) return;
    const participant = state.participants.find(
      (p) => p.id === state.drawnParticipantId
    );
    if (!participant) return;
    const prizeId = pickPrizeId(state);
    const prize = state.prizes.find((p) => p.id === prizeId);
    if (!prize) return;
    animateWheelToPrize(prize, () => {
      state.pendingSpin = { participantId: participant.id, prizeId: prize.id };
      saveState(state);
      (0, import_toastify_js.default)({
        text: `\u606D\u559C <span style="color:#324e7b;background:#e0e7ff;padding:2px 8px;border-radius:4px;font-weight:bold;">${participant.name}</span> \u8D0F\u5F97 <span style="color:#7c4a18;background:#fef3c7;padding:2px 8px;border-radius:4px;font-weight:bold;">${prize.name}</span>!`,
        escapeMarkup: false,
        duration: PAUSE_TIME,
        gravity: "top",
        position: "left",
        close: false,
        style: {
          background: "#6ee7b7",
          color: "#222",
          fontWeight: "bold",
          fontSize: "18px",
          boxShadow: "0 2px 10px rgba(16,185,129,0.07)"
        },
        stopOnFocus: false
      }).showToast();
      setTimeout(() => {
        let freshState = loadState();
        if (!freshState) return;
        finalizePendingSpin(freshState);
        saveState(freshState);
        renderGamePage();
      }, PAUSE_TIME);
    });
  }
  function main() {
    document.getElementById("admin-btn").onclick = handleAdminButton;
    document.getElementById("reset-spins-btn").onclick = handleResetSpins;
    renderGamePage();
  }
  document.addEventListener("DOMContentLoaded", main);
})();
/*! Bundled license information:

toastify-js/src/toastify.js:
  (*!
   * Toastify js 1.12.0
   * https://github.com/apvarun/toastify-js
   * @license MIT licensed
   *
   * Copyright (C) 2018 Varun A P
   *)
*/
