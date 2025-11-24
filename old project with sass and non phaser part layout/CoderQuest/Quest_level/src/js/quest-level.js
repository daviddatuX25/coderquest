// script.js
function questLevels() {
  return {
    meta: { title: 'Sample Quest' },
    segments: [],
    currentIndex: 0,
    unlocked: [],
    userAnswers: {},
    submitted: {},
    correctMap: {},
    qaIndex: 0, // which question index in current quiz is shown
    toggleMobileNav: false,
    sidebarCollapsed: false,

    get isMobile() {
      return window.innerWidth <= 900;
    },

    // helpers
    get currentSegment() {
      return this.segments[this.currentIndex];
    },
    get isQuizSegment() {
      const s = this.currentSegment;
      if (!s) return false;
      return s.type && s.type.indexOf('quiz') === 0;
    },
    get hasPrev() {
      return this.currentIndex > 0;
    },
    get canNext() {
      if (this.currentIndex >= this.segments.length - 1) return false;
      if (!this.currentSegment) return true;
      if (this.isQuizSegment) {
        const qs = this.currentSegment['quiz-data'].questions;
        for (const q of qs) if (!this.submitted[q.qid]) return false;
        return true;
      }
      return true;
    },
    get submittedAnyCurrent() {
      if (!this.currentSegment || !this.isQuizSegment) return false;
      const qs = this.currentSegment['quiz-data'].questions;
      for (const q of qs) if (this.submitted[q.qid]) return true;
      return false;
    },

    // loading
    load(json) {
      if (!json || !json.quest_level || !Array.isArray(json.quest_level.segments)) {
        this.segments = [];
        return;
      }
      this.segments = json.quest_level.segments.map(s => {
        s.title = s.title || s.seg_name;
        return s;
      });
      this.unlocked = this.segments.map((s, i) => i === 0);
      this.currentIndex = 0;
      this.qaIndex = 0;
      this.userAnswers = {};
      this.submitted = {};
      this.correctMap = {};
    },

    // sample loader for demo
    loadSample() {
      const htmlBasicsLesson = {
  quest_level: {
    segments: [
      {
        type: 'topic',
        seg_name: 't1',
        title: 'Introduction to HTML',
        content: `
          <p>HTML stands for <strong>HyperText Markup Language</strong> and is used to create the structure of web pages.</p>
          <p>HTML consists of elements (tags) that define headings, paragraphs, links, images, and more.</p>
          <p>Example of a simple HTML page structure:</p>
          <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My First Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
    &lt;p&gt;This is a paragraph.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
        `
      },
      {
        type: 'topic',
        seg_name: 't2',
        title: 'HTML Elements',
        content: `
          <p>HTML elements consist of a start tag, content, and an end tag.</p>
          <p>Common elements include:</p>
          <ul>
            <li><strong>&lt;h1&gt; - &lt;h6&gt;</strong>: Headings</li>
            <li><strong>&lt;p&gt;</strong>: Paragraphs</li>
            <li><strong>&lt;a&gt;</strong>: Links</li>
            <li><strong>&lt;img&gt;</strong>: Images</li>
            <li><strong>&lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</strong>: Lists</li>
          </ul>
          <p>Attributes provide additional information, e.g., &lt;a href="https://example.com"&gt;Link&lt;/a&gt;.</p>
        `
      },
      {
        type: 'quiz-multichoice',
        seg_name: 'q1',
        title: 'HTML Basics Quiz',
        'quiz-data': {
          questions: [
            {
              qid: 101,
              question: 'What does HTML stand for?',
              choices: [
                'HyperText Markdown Language',
                'HyperText Markup Language',
                'HighText Markup Language',
                'Hyperlinks and Text Markup Language'
              ],
              answer: 1,
              answerDisplay: 'HyperText Markup Language'
            },
            {
              qid: 102,
              question: 'Which tag is used to create a paragraph?',
              choices: ['&lt;div&gt;', '&lt;h1&gt;', '&lt;p&gt;', '&lt;a&gt;'],
              answer: 2,
              answerDisplay: '&lt;p&gt;'
            },
            {
              qid: 103,
              question: 'Which tag is used for images?',
              choices: ['&lt;img&gt;', '&lt;image&gt;', '&lt;picture&gt;', '&lt;src&gt;'],
              answer: 0,
              answerDisplay: '&lt;img&gt;'
            }
          ]
        }
      },
      {
        type: 'quiz-identification',
        seg_name: 'q2',
        title: 'Identify HTML Tags',
        'quiz-data': {
          questions: [
            {
              qid: 201,
              question: 'Name a tag used for headings in HTML',
              answer: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
              answerDisplay: 'h1 / h2 / h3 / h4 / h5 / h6'
            },
            {
              qid: 202,
              question: 'Which tag is used to create a link?',
              answer: ['a'],
              answerDisplay: '&lt;a&gt;'
            }
          ]
        }
      },
      {
        type: 'quiz-fillblanks',
        seg_name: 'q3',
        title: 'Fill in the Blank',
        'quiz-data': {
          questions: [
            {
              qid: 301,
              question: 'The HTML element used to display an image is <____>.',
              answer: 'img',
              answerDisplay: '&lt;img&gt;'
            },
            {
              qid: 302,
              question: 'The attribute used to specify the URL of a link is "____".',
              answer: 'href',
              answerDisplay: 'href'
            }
          ]
        }
      },
      {
        type: 'topic',
        seg_name: 'conclusion',
        title: 'Conclusion',
        content: `
          <p>Great job! You’ve learned the basics of HTML, including elements, attributes, and common tags.</p>
          <p>Next, you can learn about <strong>CSS</strong> to style your HTML content.</p>
        `
      }
    ]
  }
};
      this.load(htmlBasicsLesson);
    },

    // navigation
    selectSegment(idx) {
      if (!this.unlocked[idx]) return;
      this.currentIndex = idx;
      this.qaIndex = 0;
    },
    prev() {
      if (this.currentIndex > 0) this.currentIndex--;
      this.qaIndex = 0;
    },
    next() {
      if (this.currentIndex >= this.segments.length - 1) return;
      if (!this.canNext) return;
      this.unlocked[this.currentIndex + 1] = true;
      this.currentIndex++;
      this.qaIndex = 0;
    },

    // quiz interactions
    selectChoice(qid, ci) {
      this.userAnswers[qid] = ci;
    },

    submitCurrent() {
      const s = this.currentSegment;
      if (!s || !this.isQuizSegment) return;
      const qs = s['quiz-data'].questions;
      for (const q of qs) {
        if (this.submitted[q.qid]) continue;
        if (s.type === 'quiz-multichoice') {
          const selected = this.userAnswers[q.qid];
          const correctIndex = q.answer;
          const ok = (selected === correctIndex);
          this.submitted[q.qid] = true;
          this.correctMap[q.qid] = ok;
        } else if (s.type === 'quiz-fillblanks') {
          const val = (this.userAnswers[q.qid] || '').trim();
          const ok = val === q.answer;
          this.submitted[q.qid] = true;
          this.correctMap[q.qid] = ok;
        } else if (s.type === 'quiz-identification') {
          const val = (this.userAnswers[q.qid] || '').toLowerCase();
          let ok = false;
          if (Array.isArray(q.answer)) {
            for (const a of q.answer) {
              if (val.indexOf(a.toLowerCase()) !== -1) {
                ok = true;
                break;
              }
            }
          } else {
            ok = val.indexOf((q.answer || '').toLowerCase()) !== -1;
          }
          this.submitted[q.qid] = true;
          this.correctMap[q.qid] = ok;
        }
      }
      // unlock next if all submitted
      let allSubmitted = true;
      for (const q of qs) if (!this.submitted[q.qid]) allSubmitted = false;
      if (allSubmitted) this.unlocked[this.currentIndex + 1] = true;
    }
  };
}