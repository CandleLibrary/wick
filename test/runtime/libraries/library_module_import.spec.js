
import { parseSource } from "../../../build/library/component/parse/source.js";
import { createCompiledComponentClass } from "../../../build/library/component/compile/compile.js";
import { componentDataToJSStringCached } from "../../../build/library/component/render/js.js";
import Presets from "../../../build/library/common/presets.js";
import { loadModules } from "../../../build/library/runtime/load_modules.js";
import { ModuleHash } from "../../../build/library/common/hash_name.js";
import { RenderPage } from "../../../build/library/component/render/webpage.js";

assert_group("Module Import", sequence, () => {

    const source_string = `
    import URL from "@candlefw/url"

    const d = new URL("temp");

    export default <div>
    var data;
    
    <container data=\${await d.fetch()} element=div limit=${3}>
    </container>
    </div>`;

    const presets = new Presets();
    const component = await parseSource(source_string, presets);
    const comp = await createCompiledComponentClass(component, presets);
    const str = await componentDataToJSStringCached(component, presets);

    await loadModules(presets);
    const name = "@candlefw/url";
    const hash_name = ModuleHash(name);
    assert(presets.repo.size > 0);
    assert(presets.repo.has(name) == true);
    assert(presets.api[hash_name] != null);
    assert(presets.api[hash_name].default != null);
    assert(new presets.api[hash_name].default("/home/test.x").ext == "x");
    const str2 = (await RenderPage(component, presets)).page;
});
