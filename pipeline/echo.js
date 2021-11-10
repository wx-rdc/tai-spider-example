'use strict';

class EchoPipeline {

	process_item(item, spider) {
		console.log(item);
		return item;
	}
}

module.exports = EchoPipeline;