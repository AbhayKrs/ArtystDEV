import axios from 'axios';
import { viewerIP, exploreItemViewedAPI, exploreItemAPI, exploreListAPI, exploreUploadAPI, searchExploreListAPI, filterExploreListAPI, likeExploreAPI, dislikeExploreAPI, awardExploreAPI, bookmarkExploreAPI, deleteExploreItemAPI, exploreAddCommentAPI, exploreEditCommentAPI, exploreDeleteCommentAPI, exploreLikeCommentAPI, exploreDislikeCommentAPI } from '../../api';
import {
    FETCH_EXPLORE,
    FETCH_EXPLORELIST,
    HANDLE_EXPLORE_UPLOAD,
    HANDLE_DIALOG_OPEN,
    HANDLE_DIALOG_CLOSE,
    HANDLE_TABCHANGE,
    initialState
} from '../reducers/explore.reducers';

const dynamicSort = (property) => {
    return (a, b) => {
        var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
        return result;
    }
}

// function trendingCheck() {
//     var createdAt = new Date(getState().explore.exploreList[0].createdAt)
//     console.log('Trending', createdAt.getTime(), Date.now(), Date.now() - createdAt.getTime())
//     // return function (a, b) {

//     //     var result = 
//     // }
// }

// if createdAt-1 is less than createdAt-2 then check if 
const risingSort = (property) => {
    return (a, b) => {
        var result = (a[property].toLowerCase() < b[property].toLowerCase())
        return result;
    }
}

export const exploreItemViewed = (exploreID) => (dispatch, getState) => {
    exploreItemViewedAPI(exploreID, getState().common.viewer_id);
}

export const clearExploreShow = () => (dispatch, getState) => {
    dispatch({ type: FETCH_EXPLORE, payload: initialState.exploreData })
}

export const fetchExploreItem = (exploreID) => async (dispatch, getState) => {
    await exploreItemAPI(exploreID).then(res => {
        dispatch({ type: FETCH_EXPLORE, payload: res.data })
    }).catch(err => {
        console.log('---error fetchExploreItem', err);
    })
}

export const fetchExploreList = () => async (dispatch, getState) => {
    await exploreListAPI().then(res => {
        dispatch({ type: FETCH_EXPLORELIST, payload: res.data });
    }).catch(err => {
        console.log('---error fetchExploreList', err);
    })
};

export const handleExploreUpload = (exploreData) => async (dispatch, getState) => {
    await exploreUploadAPI(exploreData).then(res => {
        dispatch({ type: HANDLE_EXPLORE_UPLOAD, payload: res.data });
    }).catch(err => {
        console.log('---error handleExploreUpload', err);
    })
}

export const bookmarkExploreItem = (userID, bookmarkData) => async (dispatch, getState) => {
    await bookmarkExploreAPI(userID, bookmarkData).then(res => {
        // if (sessionStorage.jwtToken) {
        //     const token = sessionStorage.jwtToken;
        //     setAuthToken(token);
        //     dispatch(handleVerifyUser(token));
        // } else if (localStorage.jwtToken) {
        //     const token = localStorage.jwtToken;
        //     setAuthToken(token);
        //     dispatch(handleVerifyUser(token));
        // }
        console.log('success bookmarkExploreItem', res.data);
    }).catch(err => {
        console.log('---error bookmarkExploreItem', err);
    })
}

export const searchExploreList = (query, filter, period) => async (dispatch, getState) => {
    await searchExploreListAPI(query, filter, period).then(res => {
        dispatch({ type: FETCH_EXPLORELIST, payload: res.data });
    }).catch(err => {
        console.log('---error searchExploreList', err);
    })
}

export const filterExploreList = (filter, period) => async (dispatch, getState) => {
    await filterExploreListAPI(filter, period).then(res => {
        dispatch({ type: FETCH_EXPLORELIST, payload: res.data });
    }).catch(err => {
        console.log('---error filterExploreList', err);
    })
}

export const exploreVisited = () => async (dispatch, getState) => {
    console.log('page visited');
}

export const deleteExploreItem = (exploreID, userID) => async (dispatch, getState) => {
    await deleteExploreItemAPI(exploreID, userID).then(res => {
        console.log('deleted Explore');
    }).catch(err => {
        console.log('---error deleteExploreItem', err);
    })
}

export const handleDialogOpen = (value) => async (dispatch, getState) => {
    console.log('explore dialog open :: true');
    try {
        dispatch({ type: HANDLE_DIALOG_OPEN, payload: { activeDialog: true, data: value } })
    } catch (err) {
        console.log('---error handleDialogClose', err);
    }
}

export const handleDialogClose = () => async (dispatch, getState) => {
    console.log('explore dialog close :: true');
    try {
        dispatch({ type: HANDLE_DIALOG_CLOSE, payload: false })
    } catch (err) {
        console.log('---error handleDialogClose', err);
    }
}

export const handleLikeExplore = (exploreID) => async (dispatch, getState) => {
    console.log('handleLikesCount', exploreID);
    await likeExploreAPI(exploreID, getState().common.user).then(res => {
        console.log('likeCount', res.status);
    }).catch(err => {
        console.log('---error handleLikesCount', err);
    })
}

export const handleDislikeExplore = (exploreID, likeStatus) => async (dispatch, getState) => {
    console.log('handleDislikeExplore', likeStatus, exploreID);
    await dislikeExploreAPI(exploreID, getState().common.user).then(res => {
        console.log('likeCount', res.status);
    }).catch(err => {
        console.log('---error handleDislikeExplore', err);
    })
}

export const handleAwardExplore = (exploreID, userID, award) => async (dispatch, getState) => {
    console.log('handleAwardExplore', award);
    await awardExploreAPI(exploreID, userID, award).then(res => {
        console.log('award', res.status);
    }).catch(err => {
        console.log('---error handleAwardExplore', err);
    })
}

export const handleAddComment = (commentText, exploreID) => async (dispatch, getState) => {
    console.log('handleAddComment');
    await exploreAddCommentAPI(exploreID, commentText, getState().common.user).then(res => {
        console.log('commentData', res.data);
    }).catch(err => {
        console.log('---error handleAddComment', err);
    })
}

export const handleEditComment = (newComment, exploreID, commentID) => async (dispatch, getState) => {
    console.log('handleEditComment', exploreID, commentID);
    await exploreEditCommentAPI(exploreID, newComment, commentID, getState().common.user).then(res => {
        console.log('editStatus', res.data);
    }).catch(err => {
        console.log('---error handleEditComment', err);
    })
}

export const handleDeleteComment = (exploreID, commentID) => async (dispatch, getState) => {
    console.log('handleDeleteComment', exploreID, commentID);
    await exploreDeleteCommentAPI(exploreID, commentID).then(res => {
        console.log('deleteStatus', res.data);
    }).catch(err => {
        console.log('---error handleDeleteComement', err);
    })
}

export const handleLikeComment = (exploreID, commentID) => async (dispatch, getState) => {
    console.log('handleLikeComment', exploreID, commentID);
    await exploreLikeCommentAPI(exploreID, commentID, getState().common.user).then(res => {
        console.log('likeCommentCount', res.data);
    }).catch(err => {
        console.log('---error handleLikeComment', err);
    })
}

export const handleDislikeComment = (exploreID, commentID) => async (dispatch, getState) => {
    console.log('handleDislikeComment', exploreID, commentID);
    await exploreDislikeCommentAPI(exploreID, commentID, getState().common.user).then(res => {
        console.log('dislikeCommentCount', res.data);
    }).catch(err => {
        console.log('---error handleDislikeComment', err);
    })
}

export const handleTabChange = (selectedTab) => async (dispatch, getState) => {
    console.log('handleTabChange', selectedTab);
    switch (selectedTab) {
        case 'Latest': {
            let exploreList = getState().explore.exploreList;
            await dispatch({ type: FETCH_EXPLORELIST, payload: exploreList.sort(dynamicSort('createdAt')) });
            console.log('exploreList', typeof exploreList[0].createdAt, exploreList.sort(dynamicSort('createdAt'))[0]);
            break;
        }
        case 'Trending': {
            let exploreList = getState().explore.exploreList;

            await dispatch({ type: FETCH_EXPLORELIST, payload: exploreList.sort(dynamicSort('title')) });
            break;
        }
        case 'Rising': {
            let exploreList = getState().explore.exploreList;
            await dispatch({ type: FETCH_EXPLORELIST, payload: exploreList.sort(dynamicSort('title')) });
            console.log('exploreList', typeof exploreList[0].createdAt, exploreList.sort(dynamicSort('title'))[0]);
            break;
        }
        default: break;
    }
    dispatch({ type: HANDLE_TABCHANGE, payload: selectedTab })
}