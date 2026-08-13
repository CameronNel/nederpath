// NederPath Voice Integration Point (Web Speech API provider-agnostic nl-NL audio hook)
(function (global) {
  "use strict";

  class VoiceService {
    constructor() {
      this.synth = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
      this.voices = [];
      this.selectedVoice = null;
      this.initVoices();
    }

    initVoices() {
      if (!this.synth) return;
      const load = () => {
        this.voices = this.synth.getVoices();
        // Priority: Dutch voice (nl-NL or nl-BE), ideally male or high quality
        this.selectedVoice =
          this.voices.find((v) => v.lang === "nl-NL" && /male|man|maarten|ruben/i.test(v.name)) ||
          this.voices.find((v) => v.lang === "nl-NL") ||
          this.voices.find((v) => v.lang && v.lang.startsWith("nl")) ||
          null;
      };

      load();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = load;
      }
    }

    isSupported() {
      return !!this.synth;
    }

    speak(text, options = {}) {
      if (!this.synth || !text) return;
      const settings = (global.NederStore && global.NederStore.state.settings) || {};
      if (settings.voiceEnabled === false) return;

      try {
        this.synth.cancel(); // cancel any active utterance
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "nl-NL";
        utter.rate = options.rate || settings.voiceSpeed || 0.9;
        utter.pitch = options.pitch || settings.voicePitch || 1.0;
        if (this.selectedVoice) {
          utter.voice = this.selectedVoice;
        }
        this.synth.speak(utter);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }

    stop() {
      if (this.synth) this.synth.cancel();
    }
  }

  global.NederVoice = new VoiceService();
})(typeof window !== "undefined" ? window : globalThis);
