import element from "../../compiler/html/element.js";

element.prototype.stamp = function(lite, output, indent_level = 0, eleid = [0]) {

	const str = [`<${this.tag}`], child_eleid = eleid.concat([0]);

	for (const attr of this.attribs.values())
		attr.stamp(lite, output, str);

	output.html.push(lite.indent(str.join(" ") + ` pos="${eleid.join("|")}">`, indent_level));

	if(this.pinned)
        output.pinned[this.pinned] = lite.getElement(output, eleid);

	for (const child of this.children)
		child.stamp(lite, output, indent_level + 1, child_eleid);

	output.html.push(lite.indent(`</${this.tag}>`, indent_level));

	eleid[eleid.length - 1]++;
};

const finalize_mixin = element.prototype.finalize;

element.prototype.finalize = function(...d) {
	const result = finalize_mixin.call(this, ...d);

	if (this.proxied) 
		this.stamp = this.proxied.stamp.bind(this.proxied);

	return result;
};