# TODO: Fix Review System Issues

## Backend Changes
- [x] Create new migration to add missing resena fields (estado, createdAt, updatedAt) and change comentario to text
- [x] Add logs in createResena controller before and after persistAndFlush
- [x] Modify getResenas to return all reviews by default (remove estado filter)
- [x] Add admin validation in approveResena and rejectResena controllers

## Frontend Changes
- [x] Modify DetalleLibro to show all reviews (remove estado filter)
- [x] Add visual feedback (badge) for pending reviews in DetalleLibro

## Testing
- [x] Create a review and verify it saves to DB with logs
- [x] Check MySQL Workbench for correct data
- [x] Refresh page and verify all reviews appear
- [x] Test approve/reject as admin and verify changes in DB

## Followup
- [x] Run migration to update DB schema
