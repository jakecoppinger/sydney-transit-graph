select * from gtfs_shapes as shapes
where shapes.shape_id = 
(
    select distinct
    trips.shape_id
    from gtfs_routes as routes
    inner join gtfs_trips as trips on trips.route_id = routes.route_id

    where
    routes.route_short_name = 372
    and routes.agency_id = 2441 -- sydney buses
    limit 1
)