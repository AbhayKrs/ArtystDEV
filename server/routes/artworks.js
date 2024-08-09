import express from 'express';
const router = express.Router();

import { artworkgfs, artworkUpl } from '../config/gridfsconfig.js';

//Middleware
import { protect, admin } from '../middleware/authMw.js';
import { checkObjectId } from '../middleware/checkObjectId.js';

//Import Schemas
import Artworks from '../models/artwork.js';
import User from '../models/user.js';
import Common from '../models/common.js';
import Gift from '../models/gift.js';
const { Artwork, Comment } = Artworks;
const { Sticker } = Common;


// @route   Image Route --- Image from gridFS storage --- Public
router.get('/image/:filename', (req, res) => {
    try {
        // /image/:filename?
        artworkgfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            // Check if file
            if (!file || file.length === 0) {
                return res.status(404).json({ err: 'No file exists' });
            }
            // Check if image
            if (file.contentType === 'image/jpg' || file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/webp') {
                // Read output to browser
                const readstream = artworkgfs.createReadStream({
                    filename: req.params.filename,
                });
                readstream.pipe(res);
            } else {
                res.status(404).json({ err: 'Not an image' });
            }
        });
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @route   GET api/artworks --- Fetch all artworks --- Public
router.get('/', async (req, res) => {
    try {
        let response = [];
        const filter = req.query.filter;
        const period = req.query.period;
        if (!filter && !period) {
            response = await Artwork.find({}).populate('artist', 'name username avatar');
        } else {
            const artworkList = await Artwork.find({}).populate('artist', 'name username avatar');
            const getPeriod = (label) => {
                let value = 0;
                switch (label) {
                    case 'hour': { value = 3600000; break; }
                    case 'day': { value = 86400000; break; }
                    case 'week': { value = 604800000; break; }
                    case 'month': { value = 2592000000; break; }
                    case 'year': { value = 31556952000; break; }
                    default: break;
                }
                return value;
            }

            switch (filter) {
                case 'trending': {
                    response = artworkList;
                    break;
                }
                case 'popular': {
                    let filteredByPeriod = [];
                    if (period === 'all time') {
                        filteredByPeriod = artworkList;
                    } else {
                        filteredByPeriod = artworkList.filter(item => (Date.now() - item.createdAt) <= getPeriod(period));
                    }
                    response = filteredByPeriod.sort((item1, item2) => item2.likes.length - item1.likes.length)
                    break;
                }
                case 'new': {
                    response = artworkList.sort((item1, item2) => item2.createdAt - item1.createdAt)
                    break;
                }
                case 'rising': {
                    const D30_data = artworkList.filter(item => (Date.now() - item.createdAt) <= 2592000000);
                    response = D30_data.sort((item1, item2) => item2.likes.length - item1.likes.length)
                    break;
                }
                case 'most discussed': {
                    let filteredByPeriod = [];
                    if (period === 'all time') {
                        filteredByPeriod = artworkList;
                    } else {
                        filteredByPeriod = artworkList.filter(item => (Date.now() - item.createdAt) <= getPeriod(period));
                    }
                    response = filteredByPeriod.sort((item1, item2) => item2.comments.length - item1.comments.length)
                    break;
                }
                default: break;
            }
        }
        res.json(response);
    } catch (err) {
        console.error("MY error", err, err.message);
        res.status(500).send('Unable to fetch artworks data');
    }
});

// @route   Get api/artworks/:id --- Fetch Artwork by ID along with next and prev artwork reference --- Public
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id).populate('artist', 'name username avatar');
        // const viewer_id = req.body._id;

        // console.log("viewer_id", viewer_id);

        // if (!artwork) return res.status(400).send({ msg: 'Artwork not found' });

        // if (viewer_id) {
        //     artwork.views.indexOf(viewer_id) > -1 ? null : artwork.views.push(viewer_id);
        //     artwork.save();
        // }

        res.json(artwork);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to fetch artwork item');
    }
});

// @route   POST api/artworks/new --- Create an artwork entry --- Private
router.post('/new', protect, artworkUpl.any(), async (req, res) => {
    try {
        const user = await User.findById(req.body.userID);
        const newArtwork = new Artwork({
            artist: user._id,
            title: req.body.title,
            description: req.body.description,
            files: req.files.map(file => { return file.filename }),
            categories: req.body.categories,
            tags: req.body.tags,
            views: [],
            likes: [],
            comments: []
        });
        Artwork.create(newArtwork, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @route   POST api/artworks/new --- Create multiple new artwork entries --- Private
router.post('/multiupload', protect, artworkUpl.any(), async (req, res) => {
    try {
        const user = await User.findById(req.query.userID);
        let proms = [];
        req.files.map(file => {
            const prom = new Promise((resolve, reject) => {
                const newArtwork = new Artwork({
                    artist: user._id,
                    title: "title_" + file.filename,
                    description: "description_" + file.filename,
                    files: [file.filename],
                    categories: ["concept_art"],
                    tags: ["art", "myart"],
                    views: [],
                    likes: [],
                    comments: []
                });
                Artwork.create(newArtwork);
                resolve();
            })
            proms.push(prom);
        })
        Promise.all(proms).then(() => {
            console.log("done");
            res.send("done");
        })
    } catch (err) {
        console.log("--- error ", err);
        return res.status(404).json({ msg: err.name });
    }
});

// @route   PUT Edit api/artworks/:id --- Edit artwork details --- Private
router.put('/:id', protect, function (req, res) {
    try {
        const updatedArtwork = {
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags
        };
        Artwork.findByIdAndUpdate(req.params.id, { $set: updatedArtwork }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @route   Delete api/artworks/:id --- Delete an artwork --- Private
router.delete('/:id', protect, async (req, res) => {
    try {
        artworkgfs.remove({ _id: req.params.id, root: 'artworks' }, async (err, files) => {
            if (err) {
                return res.status(404).json({ err: err })
            } else {
                const users = await User.find({});
                const artwork = await Artwork.findById(req.params.id);
                if (!artwork) {
                    return res.status(404).send('Artwork not found');
                }
                users.map(user => {
                    if (user.bookmarks.some(item => item === req.params.id)) {
                        user.bookmarks = [...user.bookmarks.filter(item => item != req.params.id)];
                        console.log('test', user.bookmarks)
                        user.save();
                    }
                })
                await artwork.remove();
                res.send('Artwork removed successfully');
            }
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Artwork removal failed');
    }
}
);

// @route   PUT api/artworks/:id/like --- Like an artwork --- Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        try {
            Artwork.findByIdAndUpdate(req.params.id, {
                $push: {
                    likes: req.body.id
                }
            }, {
                new: true
            }).exec((err, like) => {
                if (err) {
                    res.status(500).send('Failed to like!');
                } else {
                    res.send(like);
                }
            });
        } catch (err) {
            res.status(500).send('Failed to get likes count!');
        }
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
})

// @route   PUT api/artworks/:id/dislike --- Dislike an artwork --- Private
router.put('/:id/dislike', protect, async (req, res) => {
    try {
        try {
            if (!req.body.id) {
                return res.status(401).json({ msg: 'User not authorized!' })
            }
            Artwork.findByIdAndUpdate(req.params.id, {
                $pull: {
                    likes: req.body.id
                }
            }, {
                new: true
            }).exec((err, dislike) => {
                if (err) {
                    res.status(500).send('Failed to like!');
                } else {
                    res.json(dislike);
                }
            });
        } catch (err) {
            res.status(500).send('Failed to get likes count!');
        }
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
})

// @route   PUT api/artworks/:id/award --- Like an artwork --- Private
router.post('/:id/gift', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        const sticker = await Sticker.findById(req.body.giftID, 'stickers');

        if (!sticker) return res.status(400).send({ msg: 'Gift not found' });

        const giftEntry = new Gift({
            artwork_id: artwork._id,
            artist_id: artwork.artist._id,
            gifter_id: req.body.gifter,
            gift_ref: sticker._id,
            message: req.body.msg
        });

        Gift.create(giftEntry, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Failed to gift the artist!');
    }
});

// @route   GET api/artworks/:id/comments --- Fetch artwork comments --- Public
router.get('/:id/comments', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        res.send(artwork.comments);
    } catch (err) {
        res.status(500).send('Adding a comment failed');
    }
});

// @route   POST api/artworks/:id/comments/new --- Add a new comment --- Private
router.post('/:id/comments/new', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        const user = await User.findById(req.body.userID);

        const newComment = new Comment({
            user_id: user._id,
            text: req.body.text,
            parent_ref: req.body.parent,
            likes: []
        });

        newComment()
            .save()
            .then(savedComment => {
                console.log('Comment saved successfully:', savedComment);

                artwork.comments.push(savedComment);
                artwork.save();
                res.send(artwork.comments);
            })
            .catch(error => {
                console.error('Error saving comment:', error);
            });
    } catch (err) {
        res.status(500).send('Adding a comment failed');
    }
});

// @route   PUT api/artworks/:id/comments/:comment_id --- Edit a comment --- Private
router.put('/:id/comments/:comment_id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        const comment = await Comment.findById(req.params.comment_id);

        if (!comment) {
            return res.status(401).json({ msg: 'Comment does not exist!' })
        }

        await Comment.findByIdAndUpdate(
            req.params.comment_id,
            { text: req.body.text },
            { new: true },
            async (err, updatedComment) => {
                if (err) {
                    console.log(err)
                } else {
                    const index = artwork.comments.findIndex(comment => comment._id === updatedComment._id);
                    artwork.comments[index] = updatedComment;
                    artwork.save();
                }
            }
        );
        return res.json(artwork.comments);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Editing a comment failed');
    }
})

// @route   DELETE api/artworks/:id/comments/:comment_id --- Delete a comment --- Private
router.delete('/:id/comments/:comment_id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        const commentIndex = artwork.comments.findIndex(comment => comment._id.toString() === req.params.comment_id);

        if (commentIndex === -1) {
            return res.status(404).json({ msg: 'Comment does not exist!' });
        }

        await Comment.findByIdAndDelete(req.params.comment_id)
            .then(deletedComment => {
                if (deletedComment) {
                    artwork.comments.splice(commentIndex, 1);
                    artwork.save();
                    return res.json(artwork.comments);
                } else {
                    console.log('Comment not found in the Comment collection.');
                }
            })
            .catch(error => {
                console.error('Error deleting comment from Comment collection:', error);
            });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Deleting a comment failed');
    }
});

// @route   PUT api/artworks/:id/comments/:comment_id/like --- Like a comment --- Private
router.put('/:id/comments/:comment_id/like', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        Comment.findByIdAndUpdate(req.params.comment_id, {
            $push: {
                likes: req.body.id
            }
        }, {
            new: true
        }).exec((err, updatedComment) => {
            if (err) {
                console.log(err)
            } else {
                const index = artwork.comments.findIndex(comment => comment._id === updatedComment._id);
                artwork.comments[index] = updatedComment;
                artwork.save();
            }
        });
    } catch (err) {
        res.status(500).send('Failed to like comment!');
    }
})

// @route   PUT api/artworks/:id/comments/:comment_id/dislike --- Dislike a comment --- Private
router.put('/:id/comments/:comment_id/dislike', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        Comment.findByIdAndUpdate(req.params.id, {
            $pull: {
                likes: req.body.id
            }
        }, {
            new: true
        }).exec((err, updatedComment) => {
            if (err) {
                console.log(err)
            } else {
                const index = artwork.comments.findIndex(comment => comment._id === updatedComment._id);
                artwork.comments[index] = updatedComment;
                artwork.save();
            }
        });
    } catch (err) {
        res.status(500).send('Failed to dislike comment!');
    }
})

export default router;
