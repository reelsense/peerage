/* eslint-env node */

'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var area = require('geojson-area');
var merge = require('geojson-merge');
var gp = require('geojson-precision');
var beautify = require('js-beautify');

async.map(fs.readdirSync(path.resolve(__dirname, './protectorates')), function(file, done) {
	file = path.resolve(__dirname, './protectorates', file);

	fs.readFile(file, function(err, data) {
		if (err) {
			done(err);
			return;
		}

		try {
			done(null, JSON.parse(data));
		}
		catch (e) {
			done(e);
		}
	});
}, function(err, protectorates) {
	if (err) {
		console.error(err);
		return;
	}

	protectorates.sort(function(a, b) {
		var areaOfA = area.geometry(a.features[0].geometry);
		var areaOfB = area.geometry(b.features[0].geometry);
		return areaOfA > areaOfB ? -1 : 1;
	});

	var merged = merge(protectorates);
	var trimmed = gp.parse(merged, 3);
	var outFile = path.resolve(__dirname, './peerage.geojson');

	fs.writeFileSync(outFile, beautify(JSON.stringify(trimmed), {
		'indent_with_tabs': true,
		'brace_style': 'end-expand'
	}));
});
