function SOURCECONSTRUCTTESTS() {
    let element = document.createElement("div")
    element.innerHTML =
`<template id="user_lookup">
	<w-case schema="any">
        <w import><div id="test_core">[date][time]sd[page_count]Z[value]</div><w-red><div>  [time][date][time][date][page_count]</div> Locovl [page_count]</w-red> of [page_count]</w>
        
        <div id="style_test" style="<w>[style]</w>">
        	<w-input type="text" name="note">[page_number]</w-input>
        </div>
        
        <div>
	        <w-case id="user_list" model="users"> Doogy
	            [data]((

	                <w-filter class="limit" value="2" import>[page_number]</w-filter>
	                <w-term>[start]</w-term>
	                <w-term>[end]</w-term>

	                <w-case trs model="any">
	                    <w-a href="<w>[location]</w>">
	                        <my-input></my-input>
	                    </w-a>
	                        Date: <w><w_datetime>[value]<w_reverse><w_color r="233">[time][date]</w_color><w_blue>date</w_blue></w_reverse>[time]</w_datetime><w>
	                </w-case>
	            ))
	        </w-case>
        </div>
    </w-case>
</template>

<template id="my-input">
   	<w export>[name]</w>
    <w-input type="text" export>[page]</w-input>
    <w-input type="text" export><w_date>[page]<w_date></w-input>
</template>`

    describe('wick.core.source.SourceConstructor', function() {

        describe("Construction of Source's", function() {

            let Source;

            let Any = wick.any({
                page_count: 34500,
                page_number: 0,
                value: "Toco Mako!!",
                time: "8pm",
                date: "Jun 19 998",
                style: "color:red"
            });

            console.log(Any)

            it('Constructs an AST on properly formatted HTML', function() {
                let constructucting_template = element.getElementsByTagName('template')[0];
                let skeleton = wick.core.source.SourceConstructor(constructucting_template, {}, element);
                Source = skeleton(Any);
                document.body.appendChild(Source.ele);
            })

            it('DOM is correctly updated when Model is changed.', function(done) {
                element = Source.ele;
                let date_element = document.getElementById("test_core").getElementsByTagName("io")[0];
                let date = date_element.innerHTML;

                Any.date = date + "bc";

                setTimeout(() => {
                    
                    let date2 = date_element.innerHTML;
                    
                    if (Any.date !== date2) throw new Error(`Expecting element to have "${Any.date}". Got "${date2}"`);
                    
                    done()
                }, 5)
            })

            it('Element attributes are updated when Model is changed.', function(done) {

                element = Source.ele;
                let style_element = document.getElementById("style_test");

                if(!style_element.style) style_element.style = "";
                
                Any.style += ";border:1px solid black";

                setTimeout(() => {

                    let style = style_element.style.border;
                    
                    if ("1px solid black" !== style) throw new Error(`Expecting element to have its border style set to "${"1px solid black"}". Got "${style}"`);
                    
                    done()
                }, 5)
            })
        })

        describe("Throws appropriate errors for various ill formatted HTML", function() {

            function test(description, expected_error_message, HTML_text) {
                it(description, function() {
                    let element = document.createElement("div")
                    element.innerHTML = HTML_text;
                    element = element.getElementsByTagName('template')[0]

                    try {
                        let t = wick.core.source.SourceConstructor(element, {}, element)
                    } catch (e) {
                        if (e.message !== expected_error_message)
                            throw new Error(`Received incorrect error message "${e.message}". Expecting: "${expected_error_message}"`);
                        else return;
                    }

                    throw new Error(`No error thrown. Expecting error: ${expected_error_message}`)
                })
            }

            test("Unmatched tag", "Tag is unmatched", `<template><w-case temp="ee"><div></div></w-case></template>`);
        });
    })
}

if (typeof module !== "undefined") module.exports = SOURCECONSTRUCTTESTS;