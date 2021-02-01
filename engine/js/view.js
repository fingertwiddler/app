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
          button.className = "expand";
          button.innerHTML = `<?xml version="1.0" encoding="iso-8859-1"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 15 15" style="enable-background:new 0 0 512 512;" xml:space="preserve"> <g> <g> <g> <path d="M447.179,251.925c-0.534-1.304-1.32-2.49-2.315-3.488l-64-64c-4.237-4.093-10.99-3.976-15.083,0.262 c-3.993,4.134-3.993,10.687,0,14.821l45.803,45.813H100.416l45.792-45.792c4.093-4.237,3.975-10.99-0.262-15.083 c-4.134-3.992-10.687-3.992-14.82,0l-64,64c-4.174,4.157-4.187,10.911-0.03,15.085c0.01,0.01,0.02,0.02,0.03,0.03l64,64 c4.237,4.093,10.99,3.976,15.083-0.262c3.993-4.134,3.993-10.687,0-14.821l-45.792-45.824h311.168l-45.792,45.792 c-4.237,4.093-4.354,10.846-0.261,15.083c4.093,4.237,10.846,4.354,15.083,0.261c0.089-0.086,0.176-0.173,0.261-0.261l64-64 c3.052-3.051,3.966-7.64,2.315-11.627L447.179,251.925z"/> <path d="M10.667,106.667C4.776,106.667,0,111.442,0,117.333v277.333c0,5.891,4.776,10.667,10.667,10.667 c5.891,0,10.667-4.776,10.667-10.667V117.333C21.333,111.442,16.558,106.667,10.667,106.667z"/> <path d="M501.333,106.667c-5.891,0-10.667,4.776-10.667,10.667v277.333c0,5.891,4.776,10.667,10.667,10.667 S512,400.558,512,394.667V117.333C512,111.442,507.224,106.667,501.333,106.667z"/> </g> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>`;
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
