
/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/


$("#table_cmd").sortable({axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true});
/*
* Fonction pour l'ajout de commande, appellé automatiquement par plugin.template
*/
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) {
		var _cmd = {configuration: {}};
	}
	if (!isset(_cmd.configuration)) {
		_cmd.configuration = {};
	}
	var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
	tr += '<td>';
	tr += '<span class="cmdAttr" data-l1key="id" style="display:none;"></span>';
	tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" style="width : 140px;" placeholder="{{Nom}}">';
	tr += '</td>';
	tr += '<td>';
	tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>';
	tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>';
	tr += '</td>';

	tr += '<td>';
	tr += '<span><input type="checkbox" class="cmdAttr checkbox-inline" data-l1key="isHistorized" /> {{Historiser}}<br/></span>';
	tr += '<span><input type="checkbox" class="cmdAttr checkbox-inline" data-l1key="isVisible" /> {{Affichage}}<br/></span>';
	tr += '</td>';

	tr += '<td>';
	if (is_numeric(_cmd.id)) {
		tr += '<a class="btn btn-default btn-xs cmdAction" data-action="configure"><i class="fa fa-cogs"></i></a> ';
		tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> {{Tester}}</a>';
	}
	tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i>';
	tr += '</td>';
	tr += '</tr>';
	$('#table_cmd tbody').append(tr);
	$('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
	if (isset(_cmd.type)) {
		$('#table_cmd tbody tr:last .cmdAttr[data-l1key=type]').value(init(_cmd.type));
	}
	jeedom.cmd.changeType($('#table_cmd tbody tr:last'), init(_cmd.subType));
}

// Lance un scan Midea
$('.eqLogicAction[data-action=scanMideaDevices]').on('click', function() {
	$('.eqLogicAction span:first').text("{{Scan en cours...}}").css({'color' : 'red'});
	$('.eqLogicAction i:first').css({'color' : 'red'});
	runMideaDiscovery();
});

function runMideaDiscovery() {
	console.log('=== Midea Discovery in progress ===');

	$.ajax({
		type: 'POST',
		url: 'plugins/mideawifi/core/ajax/mideawifi.ajax.php',
		data: {
			action: 'scanDevices'
		},
		dataType: 'json',
		error: function (request, status, error) {
			handleAjaxError(request, status, error);
		},
		success: function (data) {
			$('.eqLogicAction span:first').text("{{Lancer un scan}}").removeAttr('style');
			$('.eqLogicAction i:first').removeAttr('style');
			if (data.state != 'ok') {
				$('#div_alert').showAlert({message: data.result, level: 'danger'});
				return;
			}
			console.log(data);
			console.log(data.result.new);
			if(data.result.new == 0){
				$('#div_results').empty().append("<center><span style='color:#767676;font-size:1.2em;font-weight: bold;'>{{Aucun nouvel appareil détecté}}</span></center>");
				return;
			} else {
				$('#div_results').empty().append("<center><span style='color:#767676;font-size:1.2em;font-weight: bold;'> " + data.result.new + "{{ Nouveaux appareils détectés}}</span></center>");
			}

			var html = '<legend>{{Appareils trouvés}}</legend>';
			for (var i in data.result.devices) {
				html += '<span class="label label-info cursor" style="font-size:1.2em;">';
				html += '<a href="index.php?v=d&m=mideawifi&p=mideawifi&id='+data.result.devices[i].eqlogic+'">';
				html += data.result.devices[i].ip + ' (id=' + data.result.devices[i].id + ')';
				html += '</a></span>';
				html += '<br /><br />';
			}
			$('#div_results').append(html);
		},
		done: function(data) {
			console.log('=== Midea Discovery finished ===');
		}
	});


}