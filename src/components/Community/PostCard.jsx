import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import ProgressiveImage from './ProgressiveImage';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PostCard = ({item, onDelete, onPress}) => {
  const [postUserData, setPostUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const isLiked = item.post_like > 0;
  const likeIcon = isLiked ? heartIcon : heartIcon; //오른쪽에 색 있는 하트 아이콘으로 추후 변경

  // 좋아요 개수 가져오기
  const getLikeCount = () => {
    return item.post_like ? `${item.post_like}` : '0';
  };

  // 댓글 개수 가져오기 (TODO: 댓글 카운팅 제작)
  const getCommentCount = () => {
    return '0';
  };

  // 게시글 작성자 정보 가져오기
  const fetchPostUserData = async () => {
    try {
      const documentSnapshot = await firestore()
        .collection('users')
        .doc(item.userId)
        .get();
      if (documentSnapshot.exists) {
        setPostUserData(documentSnapshot.data());
      }
    } catch (error) {
      console.log('사용자 데이터를 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    fetchPostUserData();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfoWrapper}>
          <Image
            style={styles.userProfileImage}
            source={{
              uri:
                postUserData?.userImg ||
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
            }}
          />
          <View style={styles.userInfoTextContainer}>
            <Text style={styles.userNameText}>
              {postUserData?.fname || 'Test'} {postUserData?.lname || 'User'}
            </Text>
            <Text style={styles.postTimeText}>
              {formatDistanceToNow(item.post_created.toDate(), {
                addSuffix: true,
                locale: ko,
              })}
            </Text>
          </View>
        </View>
        <View style={styles.moreIconContainer}>
          <Image style={styles.moreIcon} resizeMode="cover" source={moreIcon} />
        </View>
      </View>
      <Text style={styles.postContentText} ellipsizeMode="tail">
        {item.post_content ? item.post_content.slice(0, 300) : ''}
        {item.post_content && item.post_content.length > 300 && (
          <>
            ...{' '}
            <Text
              style={styles.readMoreText}
              onPress={() => {
                // TODO: 상세 보기 페이지로 이동하는 로직 추가
                //navigation.navigate("PostDetail", { postId: item.id });
              }}>
              더보기
            </Text>
          </>
        )}
      </Text>
      {item.post_files && item.post_files.length > 0 ? (
        <View style={styles.postImageWrapper}>
          {item.post_files.map((imageUrl, index) => {
            console.log(`인덱스 ${index}의 이미지:`, imageUrl);
            return (
              <Image
                key={index}
                defaultImageSource={defaultPostImg}
                source={{uri: imageUrl}}
                style={styles.postImage}
                resizeMode="cover"
              />
              /*
                <ProgressiveImage
                  key={index}
                  defaultImageSource={defaultPostImg}
                  source={{ uri: imageUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                  onError={(error) => console.log("이미지 로딩 에러:", error)}
                />
              */
            );
          })}
        </View>
      ) : (
        <View style={styles.divider} />
      )}
      <View style={styles.interactionContainer}>
        <View style={styles.leftInteractionContainer}>
          <TouchableOpacity
            style={[
              styles.interactionButton,
              isLiked && styles.activeInteractionButton,
            ]}
            onPress={() => {}}>
            <Image source={likeIcon} style={{width: 24, height: 24}} />
            <Text
              style={[
                styles.interactionText,
                isLiked && styles.activeInteractionText,
              ]}>
              {getLikeCount()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton} onPress={onPress}>
            <Image source={commentIcon} style={{width: 24, height: 24}} />
            <Text style={styles.interactionText}>{getCommentCount()}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightInteractionContainer}>
          {currentUser && currentUser.uid === item.userId && (
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={() => onDelete(item.id)}>
              <Image source={shareIcon} style={{width: 24, height: 24}} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const moreIcon = require('../../assets/icons/moreIcon.png');
const commentIcon = require('../../assets/icons/commentIcon.png');
const heartIcon = require('../../assets/icons/heartIcon.png');
const shareIcon = require('../../assets/icons/shareIcon.png');
const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

export default PostCard;

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get('window').width,
    maxWidth: Dimensions.get('window').width - 60,
    marginBottom: 24,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#fefffe',
    borderStyle: 'solid',
    borderColor: '#dbdbdb',
    borderWidth: 1,
    flex: 1,
    padding: 16,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  userInfoTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  userNameText: {
    fontSize: 15,
    letterSpacing: 0,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#212529',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTimeText: {
    fontSize: 10,
    letterSpacing: 0,
    fontFamily: 'Pretendard',
    color: '#898989',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
  },
  moreIconContainer: {
    justifyContent: 'center',
  },
  moreIcon: {
    width: 24,
    height: 24,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#898989',
    textAlign: 'left',
    marginBottom: 16,
  },
  postImageWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postImage: {
    width: '48%',
    height: 150,
    marginBottom: 8,
  },

  divider: {},
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftInteractionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  rightInteractionContainer: {
    flexDirection: 'row',
  },
  interactionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 2,
  },
  activeInteractionButton: {},
  interactionText: {
    fontSize: 12,
    fontFamily: 'Pretendard',
    color: '#212529',
    marginTop: 4,
    marginLeft: 8,
  },
  activeInteractionText: {
    color: '#E4694E',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#898989',
    textDecorationLine: 'underline',
    paddingLeft: 20,
  },
});
