import matter from "https://jspm.dev/gray-matter"
import Editor from "https://jspm.dev/@toast-ui/editor"
export class View {
  constructor (o) {
    this.config = o.config
    this.model = o.model
    this.editor = new Editor({
      frontMatter: true,
      el: document.querySelector('#editor'),
      height: '100%',
      initialEditType: 'markdown',
      usageStatistics: false,
      previewStyle: 'vertical',
      events: {
        change: () => {
          document.querySelector("#save").classList.add("enabled")
        }
      },
      hooks: {
        addImageBlobHook: async (blob, callback) => {
          await this.model.saveImage(blob, callback)
          return false;
        }
      }
    });
    this.editor.eventManager.addEventType('clickCustomButton');
    this.editor.eventManager.listen('clickCustomButton', () => {
      const textObj = this.editor.getTextObject();
      /*
      const range = this.editor.getRange();
      textObj.setEndBeforeRange(range);
      */
      textObj.replaceContent(`<div class='full-image'>\n\n${textObj.getTextContent()}\n\n</div>`);
    });

    const toolbar = this.editor.getUI().getToolbar();
    toolbar.insertItem(0, {
      type: 'button',
      options: {
        el: (() => {
          const button = document.createElement('button');
          button.className = 'expand';
          button.innerHTML = "(( ))"
          return button;
        })(),
        event: 'clickCustomButton',
        tooltip: 'make full width',
      }
    });
    if (this.model.src) this.fill(this.model.src)
    document.querySelector("#delete").addEventListener("click", async (e) => {
      if (!this.model.src) return;
      let sure = confirm("are you sure?")
      if (sure) {
        await this.model.destroy()
        location.href = "/upload"
      }
    })
    document.querySelector("#unpublish").addEventListener("click", async (e) => {
      await this.model.unpublish(this.content())
      location.href = "/upload"
    })
    document.querySelector("#publish").addEventListener("click", async (e) => {
      await this.model.publish(this.content())
      location.href = "/upload"
    })
    document.querySelector("#save").addEventListener("click", async (e) => {
      let { status, path } = await this.model.save(this.content())
      if (status === "created") {
        location.href = "./editor?src=" + path;
      } else {
        document.querySelector("#save").classList.remove("enabled")
        this.editor.setMarkdown(updatedContent)
      }
    });
  }
  async fill (path) {
    let { content, data, raw }  = await this.model.load(path)
    this.editor.setMarkdown(raw)
    if (data.draft) {
      document.querySelector("#unpublish").classList.add("hidden")
      document.querySelector(".draft").classList.remove("hidden")
    }
  }
  content() {
    let raw = this.editor.getMarkdown()
    let { content, data } = matter(raw)
    return { content, data, raw }
  }
};
