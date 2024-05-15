import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {SendIcon} from '../../assets/assets';

const CommentInput = React.memo(
  ({onSubmit, editingCommentId, initialContent}) => {
    const [commentContent, setCommentContent] = useState(initialContent || '');
    const [commentContentLength, setCommentContentLength] = useState(
      initialContent?.length || 0,
    );
    const maxCommentContentLength = 200;

    useEffect(() => {
      setCommentContent(initialContent || '');
      setCommentContentLength(initialContent?.length || 0);
    }, [initialContent]);

    const handleCommentContentChange = text => {
      if (text.length <= maxCommentContentLength) {
        setCommentContent(text);
        setCommentContentLength(text.length);
      }
    };

    const handleSubmit = useCallback(() => {
      onSubmit(commentContent);
      setCommentContent('');
      setCommentContentLength(0);
    }, [commentContent, onSubmit]);

    return (
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder={editingCommentId ? '댓글 수정' : '댓글 입력'}
          multiline={true}
          value={commentContent}
          onChangeText={handleCommentContentChange}
        />
        <TouchableOpacity
          style={styles.commentSubmitButton}
          onPress={handleSubmit}>
          <Image
            style={[styles.commentSubmitIcon, styles.frameItemLayout]}
            resizeMode="cover"
            source={SendIcon}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  commentInputContainer: {
    paddingHorizontal: 18,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFFFE',
    gap: 12,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 32,
    maxHeight: 60,
    backgroundColor: '#dbdbdb',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    paddingVertical: 4,
  },
  commentSubmitButton: {},
  commentSubmitIcon: {
    height: 32,
    width: 32,
  },
});
// const planeMessageIcon = require('../../assets/newIcons/sendIcon.png');

export default CommentInput;
