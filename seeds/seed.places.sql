BEGIN;


INSERT INTO place (yelp_id, name, img_url, url, yelp_rating, location_str, location_city, location_zip, location_st, display_phone)
VALUES
('ibQJyBTE8cSwPwdlEpYIlw', 'Hopewell Brewing Company', 'https://s3-media2.fl.yelpcdn.com/bphoto/YaRR6XpBcXJNsQ3O5K5vvg/o.jpg', 'https://www.yelp.com/biz/hopewell-brewing-company-chicago-2?adjust_creative=Ugq2qgbA1Zadh_fxaYsTOg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=Ugq2qgbA1Zadh_fxaYsTOg', 4.0, '2760 N Milwaukee Ave', 'Chicago', '60647', 'IL','(773) 698-6178'),
('HuIl6H6e9U8i65Vvg_RDlQ', 'Sparrow', 'https://s3-media2.fl.yelpcdn.com/bphoto/SBnQ8VSz5tIzg1e28tzpTA/o.jpg', 'https://www.yelp.com/biz/sparrow-chicago-3?adjust_creative=Ugq2qgbA1Zadh_fxaYsTOg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=Ugq2qgbA1Zadh_fxaYsTOg', 4.5, '12 W Elm St', 'Chicago', '60610', 'IL', '(312) 725-0732'),
('C-NO4mQXovCu7m1xcfjQaQ', 'Grace and Leavitt Tavern', 'https://s3-media1.fl.yelpcdn.com/bphoto/s30rCxPaWXuKjbejGsq23g/o.jpg', 'https://www.yelp.com/biz/grace-and-leavitt-tavern-chicago?adjust_creative=Ugq2qgbA1Zadh_fxaYsTOg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=Ugq2qgbA1Zadh_fxaYsTOg', 4.0, '2157 W Grace Ave', 'Chicago', '60618', 'IL', '(773) 472-1138');

COMMIT; 

