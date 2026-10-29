'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from 'ckeditor5-custom-build';
import customUploadAdapter from './upload-adapter';
import { useRef } from 'react';

/**
 * @param {Object} [props.uploadTarget] 본문 이미지를 올릴 곳 ({ createClient, bucket }).
 *   생략하면 기본 Supabase 프로젝트·버킷을 씁니다.
 */
export default function CKEditor5({ field, tableName, uploadTarget }) {
  const editorContainerRef = useRef(null);

  function uploadAdapter(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return customUploadAdapter(loader, tableName, uploadTarget);
    };
  }
  return (
    <>
      <CKEditor
        editor={CustomEditor}
        config={{
          extraPlugins: [uploadAdapter],
          link: { addTargetToExternalLinks: true, defaultProtocol: 'http://' },
          toolbar: {
            shouldNotGroupWhenFull: false,
            items: [
              'fontSize',
              'fontColor',
              'fontBackgroundColor',
              'bold',
              'underline',
              'italic',
              'link',
              'alignment',
              'bulletedList',
              'numberedList',
              '|',
              'outdent',
              'indent',
              '|',
              'imageUpload',
              'mediaEmbed',
              'insertTable',
              '|',
              'undo',
              'redo',
              '|',
              'sourceEditing',
            ],
          },
        }}
        data={field.value || ''}
        onChange={(event, editor) => {
          const data = editor.getData();
          field.onChange(data);
        }}
        onReady={(editor) => {
          const bodyWrapper = document.querySelector('.ck-body-wrapper');
          if (bodyWrapper) {
            editorContainerRef.current.appendChild(bodyWrapper);
          }
        }}
      />
      <div ref={editorContainerRef} />
    </>
  );
}
