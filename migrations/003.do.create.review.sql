DROP TABLE IF EXISTS review;
CREATE TABLE review (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    placeId INTEGER REFERENCES place(id) ON DELETE CASCADE NULL,
    review TEXT,
    date TIMESTAMP DEFAULT now() NOT NULL
);

ALTER TABLE place ADD COLUMN reviewId INTEGER REFERENCES review(id) ON DELETE SET NULL;