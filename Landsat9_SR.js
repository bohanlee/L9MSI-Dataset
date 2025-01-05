/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-1.6452081125427043, 11.262904516516693],
          [-1.6452081125427043, 10.852727305559673],
          [-1.2452081125427616, 10.852727305559673],
          [-1.2452081125427616, 11.262904516516693]]], null, false),
    geometry2 = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-112.07232666015635, 61.61407508579793],
          [-112.07232666015635, 61.41474570227353],
          [-111.67232666015641, 61.41474570227353],
          [-111.67232666015641, 61.61407508579793]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var geometry = geometry2;

var dataset = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
                .filterBounds(geometry)
                .filterDate("2022-01-01", "2022-12-01")
                .filter(ee.Filter.lt('CLOUD_COVER',5))
                // .filter(ee.Filter.rangeContains('SUN_ELEVATION',60,120))
                ;
                
// function applyScaleFactors(image) {
//   var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
//   var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
//   return image.addBands(opticalBands, null, true)
//               .addBands(thermalBands, null, true);
// }

function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.00390625).toUint8();
  var thermalBands = image.select('ST_B.*').multiply(0.00390625).toUint8();
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

dataset = dataset.map(applyScaleFactors);
print(dataset);

var visualization = {
  // bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  bands: ['ST_B10'],
  min: 0,
  max: 255,
};
// Map.addLayer(dataset, visualization, 'dataset');
Map.centerObject(geometry, 7);
Map.addLayer(dataset, {bands:['SR_B4', 'SR_B3', 'SR_B2']}, "dataset"); 


var indexList = dataset.reduceColumns(ee.Reducer.toList(), ["system:index"]) 
                       .get("list");  
print(indexList);                    
indexList.evaluate(function(indexs) { 
  for (var i=0; i<indexs.length; i++) { 
    var image = dataset.filter(ee.Filter.eq("system:index", indexs[i])).first(); 
    // image = image.toInt8(); 
    print(image);
    
    var img_cat = ee.Image.cat(image.select("SR_B4"), 
                               image.select("SR_B3"), 
                               image.select("SR_B2"));
    print("img_cat: ", img_cat);
    var img_cat_fileName = indexs[i] + "_RGB";
    Export.image.toDrive({ 
      image: img_cat, 
      description: img_cat_fileName, 
      folder: indexs[i],
      region: geometry, 
      scale: 30, 
      crs: "EPSG:5070", 
      maxPixels: 1e13 
    });
    
    // var img_rgb = ee.Image.rgb(image.select("SR_B4"), 
    //                           image.select("SR_B3"), 
    //                           image.select("SR_B2"));
    // print("img_rgb: ", img_rgb);
    // var img_rgb_fileName = indexs[i] + '_' + "RGB";
    // Export.image.toDrive({ 
    //   image: img_rgb, 
    //   description: img_rgb_fileName, 
    //   folder: indexs[i],
    //   region: geometry, 
    //   scale: 30, 
    //   crs: "EPSG:5070", 
    //   maxPixels: 1e13 
    // }); 
    
    // var img_rgb = image.select("SR_B4", "SR_B3", "SR_B2");
    // print("img_rgb: ", img_rgb);
    // var img_rgb_fileName = indexs[i] + '_' + "SRGB";
    // Export.image.toDrive({ 
    //   image: img_rgb, 
    //   description: img_rgb_fileName, 
    //   folder: indexs[i],
    //   region: geometry, 
    //   scale: 30, 
    //   crs: "EPSG:5070", 
    //   maxPixels: 1e13 
    // }); 
    
    // var img_vis = image.visualize(["SR_B4", "SR_B3", "SR_B2"],
    //                               null,
    //                               null,
    //                               0, 
    //                               65535,
    //                               null,
    //                               null,
    //                               // ["red", "green", "blue"],
    //                               null,
    //                               false);
    // print("img_vis: ", img_vis);
    // var img_vis_fileName = indexs[i] + '_' + "VIS";
    // Export.image.toDrive({ 
    //   image: img_vis, 
    //   description: img_vis_fileName, 
    //   folder: indexs[i],
    //   region: geometry, 
    //   scale: 30, 
    //   crs: "EPSG:5070", 
    //   maxPixels: 1e13 
    // }); 
    
    // var img_rgb_color = image.visualize({bands: ["SR_B4", "SR_B3", "SR_B2"],
    //                               min: 0, 
    //                               max: 255,
    //                               });
    // print("img_rgb_color: ", img_rgb_color);
    // var img_rgb_color_fileName = indexs[i] + "_RGB_COLOR";
    // Export.image.toDrive({ 
    //   image: img_rgb_color, 
    //   description: img_rgb_color_fileName, 
    //   folder: indexs[i],
    //   region: geometry, 
    //   scale: 30, 
    //   crs: "EPSG:5070", 
    //   maxPixels: 1e13 
    // }); 
      
    var bands = ["SR_B5", "SR_B6", "SR_B7", "ST_B10"];
    for (var j = 0; j < bands.length; j++) {
      var img_one_band = image.select(bands[j]);
      var img_fileName = indexs[i] + '_' + bands[j];
      // var img_fileName = indexs[i] + '_' + j;
      // print(img_fileName);
      Export.image.toDrive({ 
        image: img_one_band, 
        description: img_fileName, 
        folder: indexs[i],
        region: geometry, 
        scale: 30, 
        crs: "EPSG:5070", 
        maxPixels: 1e13 
      }); 
    }
    
  } 
}); 
                  
