const handlePublish = () => {
  if (!hasPermission) {
    onToast(
      'error',
      'অনুমতি নেই',
      'শুধুমাত্র অনুমোদিত অ্যাডমিন ওয়েবসাইট পাবলিশ করতে পারেন।'
    );
    return;
  }

  const finalConfig: WebsiteCustomConfig = {
    ...draftConfig,
    isPublished: true,
    lastPublishedAt: new Date().toISOString()
      .replace('T', ' ')
      .substring(0, 16),
    lastPublishedBy: currentAdmin
      ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})`
      : 'Super Admin'
  };

  try {
    // প্রথমে স্থায়ীভাবে সংরক্ষণ
    localStorage.setItem(
      'colash_published_website_config',
      JSON.stringify(finalConfig)
    );

    // তারপর মূল অ্যাপের configuration আপডেট
    onPublishConfig(finalConfig);

    // Draft সরানো
    try {
      localStorage.removeItem('colash_draft_website_config');
    } catch (draftError) {
      console.warn('Draft cleanup failed:', draftError);
    }

    setDraftConfig(finalConfig);
    setHasUnsavedChanges(false);

    onToast(
      'success',
      'ওয়েবসাইট পাবলিশ সফল!',
      'তোমার পরিবর্তনগুলো সফলভাবে সংরক্ষিত ও পাবলিশ করা হয়েছে।'
    );

  } catch (error) {
    console.error('Website publishing failed:', error);

    onToast(
      'error',
      'Publish ব্যর্থ',
      'পরিবর্তন সংরক্ষণ করা যায়নি। ছবির সাইজ কমিয়ে আবার চেষ্টা করো।'
    );
  }
};
