/**
 * VpsController
 *
 * @description :: Server-side logic for managing vps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var slug = require('slug');
module.exports = {
  total: function(req, res) {
    var totalCache = Cache.get('vpsTotal');
    if (totalCache) {
      res.send(totalCache);
    } else {
      Vps
        .find()
        .then(function(vps) {
          res.send({
            total: vps.length
          });
          Cache.set('vpsTotal', {
            total: vps.length
          });
        })
        .catch(function(err) {
          res.send(500, err);
          Cache.del('vpsTotal');
        });
    }
  },
  index: function(req, res) {
    var vpsCache = Cache.get('vpsIndex');
    if (vpsCache) {
      res.send(vpsCache);
    } else {
      Vps
        .find()
        .populate('provider')
        .sort({
          updatedAt: 'desc'
        })
        .then(function(vps) {
          res.send(vps);
          Cache.set('vpsIndex', vps);
        })
        .catch(function(err) {
          res.send(500, err);
          Cache.del('vpsIndex');
        });
    }
  },
  detail: function(req, res) {
    var id = req.param('id');
    var vpsCache = Cache.get('vps' + id);
    if (vpsCache) {
      res.send(vpsCache);
    } else {
      Vps
        .findOne({
          id: id
        })
        .populate('provider')
        .then(function(vps) {
          res.send(vps);
          Cache.set('vps' + id, vps);
        })
        .catch(function(err) {
          res.send(500, err);
          Cache.del('vps' + id);
        });
    }
  },
  similar: function(req, res) {
    var id = req.param('id');
    var planCache = Cache.get('vpsPlan' + id);
    if (planCache) {
      res.send(planCache);
    } else {
      Vps
        .find({
          id: id
        })
        .populate('provider')
        .then(function(vps) {
          Vps
            .find({
              id: {
                '!': vps[0].id
              },
              ram: {
                '>=': vps[0].ram
              },
              price: {
                '>=': vps[0].price * 0.7,
                '<=': vps[0].price * 1.3
              }
            })
            .sort({
              ram: 'asc',
              price: 'asc'
            })
            .populate('provider')
            .limit(10)
            .then(function(vps) {
              res.send(vps);
              Cache.set('vpsPlan' + id, vps);
            })
            .catch(function(err) {
              Cache.del('vpsPlan' + id + id);
            })
        })
        .catch(function(err) {
          res.send(500, err);
        });
    }
  },
  create: function(req, res) {
    var providerName = req.param('provider');
    var name = req.param('name');
    var cpu = req.param('cpu');
    var ram = req.param('ram');
    var hdspace = req.param('hdspace');
    var hdtype = req.param('hdtype');
    var bandwidth = req.param('bandwidth');
    var portSpeed = req.param('portSpeed');
    var ipv4 = req.param('ipv4');
    var ipv6 = req.param('ipv6');
    var location = req.param('location');
    var virtualization = req.param('virtualization');
    var price = req.param('price');
    var link = req.param('link');
    var remark = req.param('remark');
    var provider_id;
    Provider
      .findOne({
        name: providerName
      })
      .then(function(provider) {
        if (provider) {
          provider_id = provider.id;
          createVPS();
        } else {
          Provider
            .create({
              name: providerName
            }).then(function(provider) {
              provider_id = provider.id;
              createVPS();
            })
            .catch(function(err) {
              res.send(500, err);
            });
        }
      })
      .catch(function(err) {
        res.send(500, err);
      });

    function createVPS() {
      Vps
        .create({
          provider: provider_id,
          name: name,
          cpu: cpu,
          ram: ram,
          hdspace: hdspace,
          hdtype: hdtype,
          bandwidth: bandwidth,
          portSpeed: portSpeed,
          ipv4: ipv4,
          ipv6: ipv6,
          location: location,
          virtualization: virtualization,
          price: price,
          remark: remark,
          link: link
        })
        .then(function(vps) {
          res.send(vps);
        })
        .catch(function(err) {
          res.send(500, err);
        });
    }
  },
  update: function(req, res) {
    var id = req.param('id');
    var providerName = req.param('provider');
    var name = req.param('name');
    var cpu = req.param('cpu');
    var ram = req.param('ram');
    var hdspace = req.param('hdspace');
    var hdtype = req.param('hdtype');
    var bandwidth = req.param('bandwidth');
    var portSpeed = req.param('portSpeed');
    var ipv4 = req.param('ipv4');
    var ipv6 = req.param('ipv6');
    var location = req.param('location');
    var virtualization = req.param('virtualization');
    var price = req.param('price');
    var link = req.param('link');
    var remark = req.param('remark');
    var provider_id;
    Provider
      .findOne({
        name: providerName
      })
      .then(function(provider) {
        if (provider) {
          provider_id = provider.id;
          updateVPS();
        } else {
          Provider
            .create({
              name: providerName
            }).then(function(provider) {
              provider_id = provider.id;
              updateVPS();
            })
            .catch(function(err) {
              res.send(500, err);
            });
        }
      })
      .catch(function(err) {
        res.send(500, err);
      });

    function updateVPS() {
      Vps
        .update({
          id: id
        }, {
          id: id,
          provider: provider_id,
          name: name,
          cpu: cpu,
          ram: ram,
          hdspace: hdspace,
          hdtype: hdtype,
          bandwidth: bandwidth,
          portSpeed: portSpeed,
          ipv4: ipv4,
          ipv6: ipv6,
          location: location,
          virtualization: virtualization,
          price: price,
          remark: remark,
          link: link
        })
        .then(function(vps) {
          res.send(vps[0]);
        })
        .catch(function(err) {
          res.send(500, err);
        });
    }
  },
  delete: function(req, res) {
    var id = req.param('id');
    Vps
      .destroy({
        id: id
      }).then(function() {
        res.send(200, {
          debug: "SUCCESS"
        });
      })
      .catch(function(err) {
        res.send(500, err);
      });
  },
  export: function(req, res) {
    Vps
      .find()
      .exec(function(err, vps) {
        var SQL = '';
        for (i = 0; i < vps.length; i++) {
          var row = vps[i];
          Vps
            .update({
              id: row.id
            }, row)
            .exec(function(err, vps) {

            });
          SQL = SQL + "INSERT INTO  `whpal`.`vps` (`name` ,`cpu` ,`ram` ,`hdspace` ,`hdtype` ,`bandwidth` ,`portSpeed` ,`ipv4` ,`ipv6` ,`location` ,`virtualization` ,`price` ,`link`)VALUES ('" + row.name + "',  '" + row.cpu + "',  '" + row.ram + "',  '" + row.hdspace + "', '" + row.hdtype + "',  '" + row.bandwidth + "',  '" + row.portSpeed + "',  '" + row.ipv4 + "', '" + row.ipv6 + "', '" + row.location + "', '" + row.virtualization + "',  '" + row.price + "',  '" + row.link + "');";
        }

        res.send('finish');
      })
  },
  render: function(req, res) {
    var page = req.param('page');
    var request = require('request');
    var exec = require('child_process').exec;
    Vps
      .find()
      .exec(function(err, vps) {
        renderPage(vps);
      });

    function renderPage(vps) {
      exec('casperjs ./render.js index index.html', function(err, stdout, stderr) {});
      dirtyWork(vps, 0, vps.length);
    }

    function dirtyWork(vps, i, total) {
      exec('casperjs ./render.js vps/' + vps[i].slug + ' ' + 'vps/' + vps[i].slug + '.html', function(error, stdout, stderr) {
        i++;
        if (i < total) {
          dirtyWork(vps, i, total);
        }
      });
    }
    res.send(page);
  }
};